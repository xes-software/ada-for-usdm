import { getCurrentPrice } from "@/lib/core";
import { env } from "@/lib/env";
import {
  getServerLucidInstance,
  getServerLucidFromAddress,
  getServerMerchantWallet,
} from "@/lib/lucid/server";
import { Assets, fromText } from "@lucid-evolution/lucid";
import type { NextApiRequest, NextApiResponse } from "next";

export type ApiTxRequestBody = {
  address: string;
  usdmAmount: string;
};

export type ApiTxResponseBody = {
  txCbor: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  const { address, usdmAmount } = JSON.parse(req.body) as ApiTxRequestBody;
  const lucid = await getServerLucidFromAddress(address);
  const currentPrice = await getCurrentPrice(Number(usdmAmount));
  console.log("currentPrice", currentPrice);
  const total =
    currentPrice.lovelaceAsk +
    currentPrice.exchangeLovelaceFee +
    currentPrice.setLovelaceFee;

  const merchantWallet = getServerMerchantWallet();
  const merchantAddress = await merchantWallet.address();

  const totalMerchantUtxos = await merchantWallet.getUtxos();
  const merchantUtxos = [];
  const unit = env.USDM_POLICY_ID + fromText("USDM");
  let usdmTotal = 0n;
  for (const utxo of totalMerchantUtxos) {
    if (utxo.assets[unit]) {
      merchantUtxos.push(utxo);
      usdmTotal += utxo.assets[unit];
    }
    if (usdmTotal >= BigInt(usdmAmount)) {
      break;
    }
  }

  let merchantEndingAssets: Assets = {};
  for (const utxo of merchantUtxos) {
    for (const [key, value] of Object.entries(utxo.assets)) {
      if (merchantEndingAssets[key]) {
        merchantEndingAssets[key] += value;
      } else {
        merchantEndingAssets[key] = value;
      }
    }
  }
  merchantEndingAssets[unit] -= BigInt(usdmAmount);

  const coinbaseAssets: Assets = {
    lovelace: total,
  };

  console.log("merchantEndingAssets", merchantEndingAssets);
  console.log("coinbase addressAssets", coinbaseAssets);

  console.log("Logging total:", total);
  console.log("Logging coinbase address:", env.COINBASE_CARDANO_ADDRESS);

  const tx = await lucid
    .newTx()
    .collectFrom([...merchantUtxos])
    .pay.ToAddress(env.COINBASE_CARDANO_ADDRESS, coinbaseAssets)
    .pay.ToAddress(merchantAddress, merchantEndingAssets)
    .complete();

  console.log(
    tx.toTransaction().body().outputs().get(0).amount().coin().toString(),
  );
  console.log(tx.toTransaction().body().outputs().get(1));
  console.log(tx.toTransaction().body().outputs().get(2));

  const body: ApiTxResponseBody = {
    txCbor: tx.toCBOR(),
  };

  return res.status(200).json(body);
}
