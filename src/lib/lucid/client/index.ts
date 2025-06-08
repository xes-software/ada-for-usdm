import type { MaestroSupportedNetworks } from "@lucid-evolution/lucid";
export async function getClientLucidInstance(
  lucidLibrary: typeof import("@lucid-evolution/lucid")
) {
  return lucidLibrary.Lucid(
    new lucidLibrary.Emulator([]),
    process.env.NEXT_PUBLIC_CARDANO_NETWORK! as MaestroSupportedNetworks
  );
}
