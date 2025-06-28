import { getCurrentPrice } from "@/lib/core";
import { env } from "@/lib/env";
import {
  getServerLucidInstance,
  getServerLucidFromAddress,
  getServerMerchantWallet,
} from "@/lib/lucid/server";
import type { NextApiRequest, NextApiResponse } from "next";

export type ApiTxRequestBody = {
  address: string;
  usdmAmount: string;
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
  const total = BigInt(
    currentPrice.adaAsk + currentPrice.exchangeAdaFee + currentPrice.setAdaFee,
  );

  const merchantWallet = getServerMerchantWallet();

  const totalMerchantUtxos = await merchantWallet.getUtxos();
  const merchantUtxos = [];

  let usdmTotal;
  for (const utxo of totalMerchantUtxos) {
    merchantUtxos.push(utxo);
  }

  lucid
    .newTx()
    .pay.ToAddress(env.COINBASE_CARDANO_ADDRESS, { lovelace: total });
}
