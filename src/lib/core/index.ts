import { getBestAsk } from "@/lib/coinbase/best-bid-ask";
import { formatBigIntString } from "../utils";

export async function getCurrentPrice(usdmAmount: bigint) {
  const ask = await getBestAsk();
  const price = Number(ask.price);

  const PRICE_SCALE = 1_000_000n;

  const scaledPrice = BigInt(Math.round(price * Number(PRICE_SCALE)));

  const lovelaceAsk = (usdmAmount * PRICE_SCALE) / scaledPrice;
  const exchangeLovelaceFee = (lovelaceAsk * 71n) / 10_000n;
  const setLovelaceFee = 2_000_000n;
  console.log("lovelaceAsk:", lovelaceAsk);
  console.log("exchangeLovelaceFee:", exchangeLovelaceFee);
  console.log("setLovelaceFee:", setLovelaceFee);
  return {
    lovelaceAsk,
    setLovelaceFee,
    exchangeLovelaceFee,
  };
}
