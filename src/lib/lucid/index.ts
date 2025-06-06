import {
  Lucid,
  Maestro,
  MaestroSupportedNetworks,
} from "@lucid-evolution/lucid";

export function getLucid() {
  return Lucid(
    new Maestro({
      apiKey: process.env.MAESTRO_CARDANO_API_KEY!,
      network: process.env.CARDANO_NETWORK! as MaestroSupportedNetworks,
    }),
    process.env.CARDANO_NETWORK! as MaestroSupportedNetworks,
  );
}
