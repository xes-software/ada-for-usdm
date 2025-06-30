import { sign, Secret } from "jsonwebtoken";
import crypto from "crypto";

export function getCoinbaseApiJwt(
  requestMethod: string,
  url: string,
  requestPath: string,
) {
  const key_name = process.env.COINBASE_API_KEY_NAME!;
  const key_secret = process.env.COINBASE_API_PRIVATE_KEY! as Secret;

  const algorithm = "ES256";
  const uri = requestMethod + " " + url + requestPath;

  const token = sign(
    {
      iss: "cdp",
      nbf: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 120,
      sub: key_name,
      uri,
    },
    key_secret,
    {
      algorithm,
      header: {
        kid: key_name,
        nonce: crypto.randomBytes(16).toString("hex"),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  );

  return token;
}
