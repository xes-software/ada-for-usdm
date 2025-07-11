import { MaestroSupportedNetworks } from "@lucid-evolution/lucid";

export const env = {
  MERCHANT_WALLET_SEED_PHRASE: process.env.MERCHANT_WALLET_SEED_PHRASE!,
  COINBASE_API_PRIVATE_KEY: process.env.COINBASE_API_PRIVATE_KEY!,
  COINBASE_API_KEY_NAME: process.env.COINBASE_API_KEY_NAME!,
  MAESTRO_CARDANO_API_KEY: process.env.MAESTRO_CARDANO_API_KEY!,
  CARDANO_NETWORK: process.env.CARDANO_NETWORK! as MaestroSupportedNetworks,
  COINBASE_CARDANO_ADDRESS: process.env.COINBASE_CARDANO_ADDRESS!,
  USDM_POLICY_ID: process.env.USDM_POLICY_ID!,
  USDM_ASSET_NAME: process.env.USDM_ASSET_NAME!,
  CLOUDFLARE_TURNSTILE_KEY: process.env.CLOUDFLARE_TURNSTILE_KEY!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  RESEND_GENERAL_AUDIENCE_ID: process.env.RESEND_GENERAL_AUDIENCE_ID!,
};

export function buildValidateEnv() {
  Object.entries(env).forEach(([key, value]) => {
    if (!value) {
      throw new Error(`Missing env variable: ${key}`);
    }
  });
}
