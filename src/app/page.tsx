"use client";

import Script from "next/script";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, useEffect, useState } from "react";
import { ApiParamsResponseBody } from "@/pages/api/params";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiTxRequestBody, ApiTxResponseBody } from "@/pages/api/tx";
import { Cardano } from "@lucid-evolution/lucid";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getClientLucidInstance } from "@/lib/lucid/client";
import { DollarSign } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { formatBigIntString, toBigIntFixed6 } from "@/lib/utils";

const CLOUDFLARE_TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY!;

export default function Page() {
  const [params, setParams] = useState<ApiParamsResponseBody | null>(null);
  const [usdmAmount, setUsdmAmount] = useState("100");
  const [cardano, setCardano] = useState<Cardano | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lib, setLib] = useState<
    typeof import("@lucid-evolution/lucid") | null
  >(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [responseBody, setResponseBody] = useState<ApiTxResponseBody | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/params").then((res) => {
      res.json().then((body) => {
        setParams(body);
      });
    });

    setCardano(window.cardano);
    import("@lucid-evolution/lucid")
      .then((l) => {
        setLib(l);
      })
      .catch(() =>
        toast.error(
          "Failed to load Cardano library, the page will not work as expected!",
        ),
      );
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setExchangeLoading(true);

    try {
      console.log("Form submitted with value:", usdmAmount);
      const form = event.currentTarget;
      const formData = new FormData(form as HTMLFormElement);
      const cfTurnstileResponse = formData
        .get("cf-turnstile-response")!
        .toString();

      const body: ApiTxRequestBody = {
        usdmAmount: toBigIntFixed6(usdmAmount),
        cfTurnstileResponse,
        address: address!,
      };

      const result = await fetch("/api/tx", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (result.ok === false) {
        toast.error(
          "Error while building transaction, do you have enough funds?",
        );
        return;
      }

      const responseBody = (await result.json()) as ApiTxResponseBody;
      setResponseBody(responseBody);
      setDialogOpen(true);
    } catch (e) {
      console.error(e);
      toast.error(
        "An unexpected error occured while building the transaction!",
      );
    }
    setExchangeLoading(false);

    // Perform actions with the form data, e.g., send to an API
  };

  async function signTransaction() {
    try {
      const api = await cardano![wallet!].enable();
      const lucid = await getClientLucidInstance(lib!);
      lucid.selectWallet.fromAPI(api);

      const walletSig = await lucid
        .fromTx(responseBody!.txCbor)
        .partialSign.withWallet();

      const completedTx = await lucid
        .fromTx(responseBody!.txCbor)
        .assemble([walletSig, responseBody!.serverSignature])
        .complete();
      const txHash = await completedTx.submit();
      setDialogOpen(false);
      toast.message("Success Transaction!", {
        description: txHash,
        action: (
          <Button onClick={() => navigator.clipboard.writeText(txHash)}>
            Copy
          </Button>
        ),
      });
    } catch (e) {
      console.error(e);
      toast.error("Error signing transaction! Please try again.");
    }
  }

  async function selectWallet(name: string) {
    try {
      const api = await cardano![name].enable();
      const networkId = await api.getNetworkId();
      if (networkId === 0) {
      }
      if (
        process.env.NEXT_PUBLIC_CARDANO_NETWORK === "Preprod" &&
        networkId !== 0
      ) {
        toast.error(
          "You are connected to Mainnet, expecting a Preprod address!",
        );
        return;
      }
      if (
        process.env.NEXT_PUBLIC_CARDANO_NETWORK === "Mainnet" &&
        networkId !== 1
      ) {
        toast.error(
          "You are connection to Preprod, expectinig a Mainnet address!",
        );
      }
      const lucid = await getClientLucidInstance(lib!);
      lucid.selectWallet.fromAPI(api);
      const address = await lucid.wallet().address();
      setWallet(name);
      setAddress(address);
    } catch (e) {
      console.error(e);
      toast.error("Unable to connect wallet, please try again!");
    }
  }

  return (
    <section className="h-screen w-screen pt-24 mb-24 px-8 md:px-12 lg:px-24 md:mb-0">
      <Card>
        <CardHeader>
          <CardTitle>ADA/USDM Trustless Exchange (Functional Beta)</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col md:flex-row space-x-8 space-y-10">
          <CardDescription className="w-full md:w-1/2">
            Our approach to token exchange allows for zero trust, zero slippage,
            and significantly reduced fees against other Cardano based
            exchanges. <br />
            <br />
            {params === null ? (
              <Skeleton className="h-4 w-full"></Skeleton>
            ) : (
              <span>
                The current <strong>USDM reserves</strong> is{" "}
                {formatBigIntString(params.reserveUsdm, 6)}
              </span>
            )}{" "}
            <br /> <br />
            {params === null ? (
              <Skeleton className="h-4 w-full"></Skeleton>
            ) : (
              <span>
                The current <strong>ADA/USDM price</strong> is $
                {params.lovelaceUsdmBestAsk}
              </span>
            )}{" "}
            <br /> <br />
            The current fee structure is a flat 2 ADA protocol fee, and a 0.71%
            exchange fee. Compare with Minswap ADA/USDM pair (0.75%) & Coinbase
            Advanced Trading ADA/USDC pair (1.20% Taker). Also consider, this
            pair has ZERO slippage, which greatly increases the value of
            exchange.
          </CardDescription>

          <CardDescription className="w-full md:w-1/2">
            <form id="contact-form" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="amount-usdm">Amount in USDM</Label>
                <Input
                  className="w-full"
                  id="amount-usdm"
                  type="number"
                  step="0.000001"
                  value={usdmAmount}
                  onChange={(e) => setUsdmAmount(e.target.value)}
                ></Input>
                {params === null ? (
                  <Skeleton className="h-4 w-full"></Skeleton>
                ) : (
                  <div>
                    <div>
                      Price:{" "}
                      {Math.trunc(
                        (Number(usdmAmount) * 1000000) /
                          Number(params.lovelaceUsdmBestAsk),
                      ) / 1000000}{" "}
                      ADA
                    </div>
                    <div>
                      Exchange Fee:{" "}
                      {(Math.trunc(
                        (Number(usdmAmount) * 1000000) /
                          Number(params.lovelaceUsdmBestAsk),
                      ) *
                        71) /
                        10000 /
                        1000000}{" "}
                      ADA
                    </div>
                    <div>Protocol Fee: 2 ADA</div>
                  </div>
                )}

                <Script
                  src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                  async
                  defer
                ></Script>
                <div
                  className="cf-turnstile"
                  data-sitekey={CLOUDFLARE_TURNSTILE_SITE_KEY}
                  data-callback="javascriptCallback"
                ></div>
                <div className="flex space-x-1 items-center justify-center">
                  {cardano &&
                    Object.keys(cardano).length > 0 &&
                    Object.keys(cardano).map((key) => (
                      <Button
                        key={key}
                        type="button"
                        variant={key === wallet ? "default" : "outline"}
                        className="flex items-center justify-center w-20 h-20"
                        onClick={() => selectWallet(cardano[key].name)}
                        disabled={lib === null}
                      >
                        <Image
                          width={40}
                          height={40}
                          src={cardano[key].icon}
                          alt={cardano[key].name}
                        />
                      </Button>
                    ))}
                  {cardano && Object.keys(cardano).length === 0 && (
                    <div>No detected Cardano Wallets</div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  disabled={
                    wallet === null ||
                    address === null ||
                    exchangeLoading === true
                  }
                >
                  {exchangeLoading === true ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Building Transaction...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="size-4" />
                      <span>Build Exchange</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardDescription>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          showCloseButton={false}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
            <DialogDescription>
              This transaction becomes inactive after 2 minutes.
            </DialogDescription>
          </DialogHeader>

          {responseBody && (
            <div>
              <div>
                Spot Price: {formatBigIntString(responseBody.lovelaceAsk, 6)}{" "}
                ADA
              </div>
              <div>
                Exchange Fee (0.71%):{" "}
                {formatBigIntString(responseBody.exchangeLovelaceFee, 6)} ADA
              </div>
              <div>
                Protocol Fee:{" "}
                {formatBigIntString(responseBody.setLovelaceFee, 6)} ADA
              </div>
              <div>
                Total ADA:{" "}
                {formatBigIntString(
                  String(
                    BigInt(responseBody.exchangeLovelaceFee) +
                      BigInt(responseBody.lovelaceAsk) +
                      BigInt(responseBody.setLovelaceFee),
                  ),
                  6,
                )}{" "}
                ADA
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => location.reload()}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => signTransaction()}>
              Sign Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
