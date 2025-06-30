import {
  generateSeedPhrase,
  Emulator,
  makeWalletFromSeed,
} from "@lucid-evolution/lucid";

const seed = generateSeedPhrase();
const wallet = makeWalletFromSeed(new Emulator([]), "Preprod", seed);
wallet.address().then((address) => {
  console.log(seed);
  console.log(address);
});
