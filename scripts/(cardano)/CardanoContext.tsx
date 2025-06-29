"use client";
import { getClientLucidInstance } from "@/lib/lucid/client";
import { ApiQuoteResponseBody } from "@/pages/api/quote";
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
  getUsdmQuote: (usdm_amount: string) => Promise<void>;
  isCardanoContextLoading: boolean;
  lovelace: bigint;
  lucidLibrary: typeof import("@lucid-evolution/lucid") | null;
  apiQuote: ApiQuoteResponseBody | null;
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
  const [apiQuote, setApiQuote] = useState<ApiQuoteResponseBody | null>(null);

  async function getUsdmQuote(usdm_amount: string) {
    const searchParams = new URLSearchParams({ usdm_amount });
    const response = await fetch("/api/quote?" + searchParams.toString());
    setApiQuote(await response.json());
  }

  useEffect(() => {
    async function loadCardanoContext() {
      const [l] = await Promise.all([
        import("@lucid-evolution/lucid"),
        getUsdmQuote("100000000"),
      ]);
      setLucidLibrary(l);
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
        getUsdmQuote,
        apiQuote,
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
