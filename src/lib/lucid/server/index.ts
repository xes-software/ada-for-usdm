import {
  Lucid,
  Maestro,
  MaestroSupportedNetworks,
  makeWalletFromAddress,
  makeWalletFromPrivateKey,
} from "@lucid-evolution/lucid";
import { env } from "@/lib/env";

const maestro = new Maestro({
  apiKey: env.MAESTRO_CARDANO_API_KEY,
  network: env.CARDANO_NETWORK,
});

export function getServerLucidInstance() {
  return Lucid(maestro, env.CARDANO_NETWORK);
}

export async function getServerLucidFromAddress(address: string) {
  const utxos = await maestro.getUtxos(address);
  const lucid = await getServerLucidInstance();
  lucid.selectWallet.fromAddress(address, utxos);
  return lucid;
}

export function getServerMerchantWallet() {
  return makeWalletFromPrivateKey(
    maestro,
    env.CARDANO_NETWORK,
    env.MERCHANT_WALLET_KEY,
  );
}
