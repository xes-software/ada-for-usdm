"use client";
import { getClientLucidInstance } from "@/lib/lucid/client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

interface CardanoContextType {
  selectedWallet: string | null;
  setSelectedWallet: (wallet: string | null) => void;
  isCardanoContextLoading: boolean;
  lovelace: bigint;
  lucidLibrary: typeof import("@lucid-evolution/lucid") | null;
}

const CardanoContext = createContext<CardanoContextType | undefined>(undefined);

export function CardanoProvider({ children }: { children: ReactNode }) {
  const [selectedWallet, setSelectedWalletInternal] = useState<string | null>(
    null,
  );
  const [isCardanoContextLoading, setIsCardanoContextLoading] = useState(true);
  const [lovelace, setLovelace] = useState<bigint>(0n);
  const [lucidLibrary, setLucidLibrary] = useState<
    typeof import("@lucid-evolution/lucid") | null
  >(null);

  useEffect(() => {
    async function loadCardanoContext() {
      const l = await import("@lucid-evolution/lucid");
      const selectedWallet = localStorage.getItem("selectedWallet");
      if (selectedWallet) {
        setSelectedWalletInternal(selectedWallet);
        const api = await window.cardano[selectedWallet].enable();
        const lucid = await getClientLucidInstance(l!);
        lucid.selectWallet.fromAPI(api);
        const utxos = await lucid.wallet().getUtxos();

        let lovelace = 0n;
        for (const utxo of utxos) {
          lovelace += utxo.assets["lovelace"];
        }
        setLovelace(lovelace);
      }
      setLucidLibrary(l);
      setIsCardanoContextLoading(false);
    }

    loadCardanoContext()
      .then()
      .catch((e) => console.error(e));
  }, []);

  async function setSelectedWallet(wallet: string | null) {
    setSelectedWalletInternal(wallet);
    if (wallet) {
      localStorage.setItem("selectedWallet", wallet);
      const lucid = await getClientLucidInstance(lucidLibrary!);
      lucid.selectWallet.fromAPI(await window.cardano[wallet].enable());
      const utxos = await lucid.wallet().getUtxos();
      let lovelace = 0n;
      for (const utxo of utxos) {
        lovelace += utxo.assets["lovelace"];
      }
      setLovelace(lovelace);
    } else {
      localStorage.removeItem("selectedWallet");
      setLovelace(0n);
    }
  }

  return (
    <CardanoContext.Provider
      value={{
        selectedWallet,
        isCardanoContextLoading,
        setSelectedWallet,
        lovelace,
        lucidLibrary,
      }}
    >
      {children}
    </CardanoContext.Provider>
  );
}

export function useCardanoContext() {
  const context = useContext(CardanoContext);
  if (context === undefined) {
    throw new Error("useCardanoContext must be used within a CardanoProvider");
  }
  return context;
}
