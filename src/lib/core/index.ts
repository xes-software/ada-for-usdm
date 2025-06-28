import { getBestAsk } from "@/lib/coinbase/best-bid-ask";

export async function getCurrentPrice(usdmAmount: number) {
  const ask = await getBestAsk();
  const price = Number(ask.price) - 0.0027;
  const adaAsk = usdmAmount / price;
  return {
    adaAsk,
    setAdaFee: 2,
    exchangeAdaFee: adaAsk * 0.0125,
  };
}
