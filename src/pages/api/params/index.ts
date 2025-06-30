import type { NextApiRequest, NextApiResponse } from "next";
import { getServerMerchantWallet } from "@/lib/lucid/server";
import { env } from "@/lib/env";
import { fromText } from "@lucid-evolution/lucid";
import { getBestAsk } from "@/lib/coinbase/best-bid-ask";

export type ApiParamsResponseBody = {
  reserveUsdm: string;
  lovelaceUsdmBestAsk: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const ask = await getBestAsk();

  const wallet = getServerMerchantWallet();
  const utxos = await wallet.getUtxos();

  console.log("Logging utxos:", utxos);
  let balance: bigint = 0n;
  const unit = env.USDM_POLICY_ID + fromText("(333) USDM");
  console.log("Logging Unit:", unit);
  utxos.forEach((utxo) => {
    if (utxo.assets[unit]) {
      balance += utxo.assets[unit];
    }
  });

  const body: ApiParamsResponseBody = {
    reserveUsdm: String(balance),
    lovelaceUsdmBestAsk: ask.price,
  };

  return res.status(200).json(body);
}
