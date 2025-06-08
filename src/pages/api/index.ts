import { getServerLucidInstance } from "@/lib/lucid/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { fromText, type UTxO, Data } from "@lucid-evolution/lucid";
import { getOneShotMintValidator } from "@/plutus";

export type BuildTxRequest = {
  address: string;
  utxo: {
    outputIndex: number;
    txHash: string;
  };
};

export type BuildTxResponse = {
  txCbor: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { address, utxo } = JSON.parse(req.body) as BuildTxRequest;
  console.log("UTXO:", utxo);

  const { mintingPolicy, policyId } = await getOneShotMintValidator(
    utxo.txHash,
    utxo.outputIndex,
  );

  console.log("PolicyId:", policyId);

  const lucid = await getServerLucidInstance();

  const unit = policyId + fromText("Newest Asset");

  const spending_utxo = await lucid.utxosByOutRef([
    { outputIndex: utxo.outputIndex, txHash: utxo.txHash },
  ]);
  console.log("Spending UTXO:", spending_utxo);

  const walletUtxos = await lucid.utxosAt(address);
  lucid.selectWallet.fromAddress(address, walletUtxos);

  const tx = await lucid
    .newTx()
    .collectFrom(spending_utxo)
    .mintAssets({ [unit]: 1000n }, Data.void())
    .pay.ToAddress(address, { [unit]: 1000n })
    .attach.MintingPolicy(mintingPolicy)
    .complete();
  const response: BuildTxResponse = {
    txCbor: tx.toCBOR(),
  };

  return res.status(200).json(response);
}
