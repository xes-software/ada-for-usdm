export async function getClientLucidInstance(
  lucidLibrary: typeof import("@lucid-evolution/lucid"),
) {
  return lucidLibrary.Lucid(new lucidLibrary.Emulator([]), "Preprod");
}
