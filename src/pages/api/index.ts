import { getCoinbaseApiJwt } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = getCoinbaseApiJwt("GET", "api.coinbase.com", "/v2/accounts");

  const addresses = await fetch("https://api.coinbase.com/v2/accounts", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const body = await addresses.json();

  let accountId: string | undefined;
  body.data.forEach((account) => {
    if (account?.currency?.name === "Cardano") {
      accountId = account.id;
    }
  });

  console.log(accountId);

  const token2 = getCoinbaseApiJwt(
    "GET",
    "api.coinbase.com",
    "/v2/accounts/" + accountId + "/transactions",
  );

  const transactions = await fetch(
    "https://api.coinbase.com/v2/accounts/" + accountId + "/transactions",
    {
      headers: {
        Authorization: "Bearer " + token2,
      },
    },
  );

  type Transaction = {
    // THIS IS THE ADA AMOUNT
    amount: { amount: string; currency: string };
    created_at: string;
    id: string;
    // THIS IS USD AMOUNT
    native_amount: { amount: string; currency: string };
    // network.hash is transaction hash
    network: {
      hash: string;
      network_name: "cardano";
      status: "unconfirmed" | "pending" | "confirmed";
    };
    resource: string;
    resource_path: string;
    status: "pending" | "completed";
    type: "send";
  };
  const transaction = (await transactions.json()).data[0];

  console.log(transaction);

  const token3 = getCoinbaseApiJwt(
    "post",
    "api.coinbase.com",
    "/api/v3/brokerage/orders/preview",
  );

  let data = JSON.stringify({
    product_id: "ADA-USDC",
    side: "SELL",
    order_configuration: {
      market_market_ioc: {
        base_size: "1",
      },
    },
  });

  const previewOrder = await fetch(
    "https://api.coinbase.com/api/v3/brokerage/orders/preview",
    {
      headers: {
        "Content-Type": "application-json",
        Authorization: "Bearer " + token3,
      },
      body: data,
      method: "post",
    },
  );

  console.log(previewOrder.status);

  type PreviewOrder = {
    order_total: string;
    commission_total: string;
    errs: [];
    warning: [];
    quote_size: string;
    base_size: string;
    best_bid: string;
    best_ask: string;
    is_max: false;
    order_margin_total: string;
    leverage: string;
    long_leverage: string;
    short_leverage: string;
    slippage: string;
    preview_id: string;
    current_liquidation_buffer: string;
    projected_liquidation_buffer: string;
    max_leverage: "";
    pnl_configuration: null;
    twap_bucket_metadata: null;
    position_notional_limit: "";
    max_notional_at_requested_leverage: "";
    margin_ratio_data: {
      current_margin_ratio: "0";
      projected_margin_ratio: "0";
    };
  };

  const previewOrderBody = await previewOrder.json();

  const orderUuid = previewOrderBody.preview_id;

  const token4 = getCoinbaseApiJwt(
    "post",
    "api.coinbase.com",
    "/api/v3/brokerage/orders",
  );

  const orderBody = {
    product_id: "ADA-USDC",
    side: "SELL",
    client_order_id: orderUuid,
    order_configuration: {
      market_market_ioc: {
        base_size: "1",
      },
    },
  };

  const order = await fetch(
    "https://api.coinbase.com/api/v3/brokerage/orders",
    {
      headers: {
        "Content-Type": "application-json",
        Authorization: "Bearer " + token4,
      },
      body: JSON.stringify(orderBody),
      method: "post",
    },
  );

  console.log(await order.json());

  return res.status(200).end();
}
