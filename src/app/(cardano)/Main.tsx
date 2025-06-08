import { getClientLucidInstance } from "@/lib/lucid/client";
import { useCardanoContext } from "./CardanoContext";
import { BuildTxRequest, BuildTxResponse } from "@/pages/api";

export default function Main() {
  const { selectedWallet, lucidLibrary, setSelectedWallet } =
    useCardanoContext();

  return (
    <>
      <button
        onClick={async () => {
          console.log("Selected Wallet:", selectedWallet);
          if (lucidLibrary && selectedWallet) {
            const lucid = await getClientLucidInstance(lucidLibrary);
            const api = await window.cardano[selectedWallet].enable();
            lucid.selectWallet.fromAPI(api);
            const address = await lucid.wallet().address();
            const utxos = await lucid.wallet().getUtxos();
            console.log("UTXO:", utxos[0]);
            const body: BuildTxRequest = {
              address,
              utxo: {
                outputIndex: utxos[0]!.outputIndex,
                txHash: utxos[0]!.txHash,
              },
            };

            const result = await fetch("/api", {
              body: JSON.stringify(body),
              method: "POST",
            });

            const { txCbor } = (await result.json()) as BuildTxResponse;
            const tx = await lucid.fromTx(txCbor).sign.withWallet().complete();
            const txHash = await tx.submit();
            console.log("TxHash:", txHash);
          }
        }}
      >
        Mint Assets
      </button>
    </>
  );
}
