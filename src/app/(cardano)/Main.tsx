import { getClientLucidInstance } from "@/lib/lucid/client";
import { useCardanoContext } from "./CardanoContext";
import { BuildTxRequest, BuildTxResponse } from "@/pages/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import Image from "next/image";

export default function Main() {
  const { selectedWallet, lucidLibrary, setSelectedWallet, lovelace } =
    useCardanoContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const connectWallet = async (wallet: string) => {
    if (lucidLibrary) {
      const api = await window.cardano[wallet].enable();
      const networkId = await api.getNetworkId();
      if (networkId !== 0) {
        toast.error("Please switch to the preprod network.", {
          duration: 10000,
        });
        return;
      }
      await setSelectedWallet(wallet);
      setIsDialogOpen(false);
    } else {
      toast.error("Lucid library did not load!");
    }
  };

  const disconnectWallet = async () => {
    await setSelectedWallet(null);
  };

  const mintToken = async () => {
    setIsMinting(true);
    if (lucidLibrary && selectedWallet) {
      const lucid = await getClientLucidInstance(lucidLibrary);
      const api = await window.cardano[selectedWallet].enable();
      lucid.selectWallet.fromAPI(api);
      const address = await lucid.wallet().address();
      const utxos = await lucid.wallet().getUtxos();
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

      if (result.ok) {
        const { txCbor } = (await result.json()) as BuildTxResponse;

        try {
          const tx = await lucid.fromTx(txCbor).sign.withWallet().complete();
          const txHash = await tx.submit();
          console.log("TxHash:", txHash);
          toast.success("Transaction submitted successfully!", {
            description: ``,
            action: (
              <Button onClick={() => navigator.clipboard.writeText(txHash)}>
                Copy Tx Hash
              </Button>
            ),
            duration: 10000,
          });
        } catch (e) {
          toast.error("Failed sign & submit the transaction.", {
            description: "Did you close out of the extension?",
            duration: 10000,
          });
        }
      } else {
        toast.error("Failed to build the mint transaction.", {
          description:
            "Does your wallet have funds and a collateral UTxO of at least 5 ADA?",
          duration: 10000,
        });
      }
    }
    setIsMinting(false);
  };

  return (
    <div className="container mx-auto mt-20">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mint Unique NFT</CardTitle>
          <CardDescription>
            This NFT is completely unique and cannot be minted again using the
            same policy ID. Each mint uses an unspent transaction output and
            validates that it is spent during the transaction. The blockchain
            enforces a UTxO's uniqueness, giving our asset verifiable permanent
            non-fungibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedWallet ? (
            <>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <span className="font-medium">Wallet Balance:</span>
                <span className="font-mono">
                  {Number(lovelace) / 1_000_000} ₳
                </span>
              </div>
              <Button
                className="w-full"
                onClick={mintToken}
                disabled={isMinting}
              >
                Mint Single NFT
              </Button>
              <Button className="w-full" onClick={disconnectWallet}>
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Connect Wallet</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select a Wallet</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4 items-center">
                  {window.cardano &&
                    Object.keys(window.cardano).map((wallet) => (
                      <Button
                        key={wallet}
                        variant="outline"
                        className="h-full flex items-center justify-center"
                        onClick={() => connectWallet(wallet)}
                      >
                        <Image
                          width={125}
                          height={125}
                          src={window.cardano[wallet].icon}
                          alt={`${wallet} icon`}
                        />
                      </Button>
                    ))}
                  {window.cardano &&
                    Object.keys(window.cardano).length === 0 && (
                      <p className="text-center text-muted-foreground col-span-2">
                        No CIP-30 compatible wallets found. Please install a
                        Cardano wallet extension.
                      </p>
                    )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
