import { getCurrentPrice } from "@/lib/core";
import { env } from "@/lib/env";
import {
  getServerLucidFromAddress,
  getServerMerchantWallet,
} from "@/lib/lucid/server";
import { Assets, walletFromSeed } from "@lucid-evolution/lucid";
import type { NextApiRequest, NextApiResponse } from "next";

export type ApiTxRequestBody = {
  address: string;
  usdmAmount: string;
  cfTurnstileResponse: string;
};

export type ApiTxResponseBody = {
  txCbor: string;
  expiry: number;
  serverSignature: string;
  lovelaceAsk: string;
  exchangeLovelaceFee: string;
  setLovelaceFee: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { address, usdmAmount, cfTurnstileResponse } = JSON.parse(
    req.body,
  ) as ApiTxRequestBody;

  const verifyFormData = new FormData();
  verifyFormData.append("secret", env.CLOUDFLARE_TURNSTILE_KEY);
  verifyFormData.append("response", String(cfTurnstileResponse));

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  const result = await fetch(url, {
    body: verifyFormData,
    method: "POST",
  });

  const outcome = await result.json();
  if (!outcome.success) {
    return res.status(401).end();
  }

  const lucid = await getServerLucidFromAddress(address);
  const currentPrice = await getCurrentPrice(BigInt(usdmAmount));

  const total =
    currentPrice.lovelaceAsk +
    currentPrice.exchangeLovelaceFee +
    currentPrice.setLovelaceFee;

  const merchantWallet = getServerMerchantWallet();
  const merchantAddress = await merchantWallet.address();

  const totalMerchantUtxos = await merchantWallet.getUtxos();
  const merchantUtxos = [];
  const unit = env.USDM_POLICY_ID + env.USDM_ASSET_NAME;
  console.log("Logging Unit:", unit);
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

  const merchantEndingAssets: Assets = {};
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

  const expiry = Date.now() + 1000 * 60 * 2; // 2 minutes
  const tx = await lucid
    .newTx()
    .collectFrom([...merchantUtxos])
    .pay.ToAddress(env.COINBASE_CARDANO_ADDRESS, coinbaseAssets)
    .pay.ToAddress(merchantAddress, merchantEndingAssets)
    .validTo(expiry)
    .complete();

  const privateKey = walletFromSeed(env.MERCHANT_WALLET_SEED_PHRASE).paymentKey;
  const signature = await tx.partialSign.withPrivateKey(privateKey);

  const body: ApiTxResponseBody = {
    txCbor: tx.toCBOR(),
    expiry,
    setLovelaceFee: String(currentPrice.setLovelaceFee),
    lovelaceAsk: String(currentPrice.lovelaceAsk),
    exchangeLovelaceFee: String(currentPrice.exchangeLovelaceFee),
    serverSignature: signature,
  };
  console.log(body);

  return res.status(200).json(body);
}
