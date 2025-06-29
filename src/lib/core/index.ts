import { getBestAsk } from "@/lib/coinbase/best-bid-ask";

export async function getCurrentPrice(usdmAmount: number) {
  const ask = await getBestAsk();
  const price = Number(ask.price) - 0.0027;
  const lovelaceAsk = BigInt(Math.trunc(usdmAmount / price));
  return {
    lovelaceAsk,
    setLovelaceFee: 2_000_000n,
    exchangeLovelaceFee: (lovelaceAsk * 125n) / 10_000n,
  };
}
