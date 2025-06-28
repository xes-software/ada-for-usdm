import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentPrice } from "@/lib/core";
import { getServerMerchantWallet } from "@/lib/lucid/server";
import { env } from "@/lib/env";
import { fromText } from "@lucid-evolution/lucid";

export type ApiQuoteResponseBody = {
  adaAsk: number;
  setAdaFee: number;
  exchangeAdaFee: number;
  reserveUsdm: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }
  const { usdm_amount } = req.query;
  if (!usdm_amount) {
    return res.status(400).end();
  }
  const usdmAmount = Number(usdm_amount);
  const { adaAsk, setAdaFee, exchangeAdaFee } =
    await getCurrentPrice(usdmAmount);

  const wallet = getServerMerchantWallet();
  const utxos = await wallet.getUtxos();
  let balance: bigint = 0n;
  utxos.forEach((utxo) => {
    if (utxo.assets[env.USDM_POLICY_ID + fromText("USDM")]) {
      balance += utxo.assets[env.USDM_POLICY_ID + fromText("USDM")];
    }
  });

  const body = {
    adaAsk,
    setAdaFee,
    exchangeAdaFee,
    reserveUsdm: balance,
  };

  return res.status(200).json(body);
}
