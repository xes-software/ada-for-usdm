import { getCoinbaseApiJwt } from "../jwt";

export async function getBestAsk() {
  const token = getCoinbaseApiJwt(
    "GET",
    "api.coinbase.com",
    "/api/v3/brokerage/best_bid_ask",
  );
  const params = new URLSearchParams({
    product_ids: "ADA-USDC",
  });

  const result = await fetch(
    "https://api.coinbase.com/api/v3/brokerage/best_bid_ask?" +
      params.toString(),
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    },
  );

  const body = (await result.json()) as {
    pricebooks: {
      product_id: string;
      asks: { price: string; size: string }[];
      bids: { price: string; size: string }[];
      time: string;
    }[];
  };
  return body.pricebooks[0].asks[0];
}
