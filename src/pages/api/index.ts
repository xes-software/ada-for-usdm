import { getServerLucidInstance } from "@/lib/lucid/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { fromText, Data } from "@lucid-evolution/lucid";
import { getOneShotMintValidator } from "@/plutus";
import prisma from "@/lib/prisma";

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
  const { mintingPolicy, policyId } = await getOneShotMintValidator(
    utxo.txHash,
    utxo.outputIndex,
  );

  const lucid = await getServerLucidInstance();

  const unit = policyId + fromText("NFT");

  const spending_utxo = await lucid.utxosByOutRef([
    { outputIndex: utxo.outputIndex, txHash: utxo.txHash },
  ]);

  const walletUtxos = await lucid.utxosAt(address);
  lucid.selectWallet.fromAddress(address, walletUtxos);

  const tx = await lucid
    .newTx()
    .collectFrom(spending_utxo)
    .mintAssets({ [unit]: 1n }, Data.void())
    .pay.ToAddress(address, { [unit]: 1n })
    .attach.MintingPolicy(mintingPolicy)
    .complete();
  const response: BuildTxResponse = {
    txCbor: tx.toCBOR(),
  };

  await prisma.transaction.create({
    data: {
      txHash: tx.toCBOR(),
    },
  });

  return res.status(200).json(response);
}
