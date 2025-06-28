import {
  Lucid,
  makeWalletFromPrivateKey,
  scriptFromNative,
  Native,
  getAddressDetails,
  Maestro,
  mintingPolicyToId,
  unixTimeToSlot,
  fromText,
} from "@lucid-evolution/lucid";
import { loadEnv } from "./utils";
loadEnv();

const maestro = new Maestro({
  network: "Preprod",
  apiKey: process.env.MAESTRO_CARDANO_API_KEY!,
});

async function main() {
  const wallet = makeWalletFromPrivateKey(
    maestro,
    "Preprod",
    process.env.MERCHANT_WALLET_KEY!,
  );

  const address = await wallet.address();
  const details = getAddressDetails(address);
  const lucid = await Lucid(maestro, "Preprod");

  lucid.selectWallet.fromPrivateKey(process.env.MERCHANT_WALLET_KEY!);

  const native: Native = {
    type: "all",
    scripts: [
      {
        type: "sig",
        keyHash: details.paymentCredential!.hash,
      },
      {
        type: "before",
        slot: unixTimeToSlot("Preprod", Date.now() + 60 * 12 * 1000),
      },
    ],
  };

  const script = scriptFromNative(native);
  const policyId = mintingPolicyToId(script);
  const unit = policyId + fromText("USDM");
  const tx = await lucid
    .newTx()
    .mintAssets({ [unit]: 100_000_000_000n })
    .attach.MintingPolicy(script)
    .validTo(Date.now() + 60 * 12 * 1000)
    .complete();

  const signedTx = await tx.sign.withWallet().complete();
  const txHash = await signedTx.submit();
  console.log(txHash);
}

main();
