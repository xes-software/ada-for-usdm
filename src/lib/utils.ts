import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
const { sign } = require("jsonwebtoken");
const crypto = require("crypto");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCoinbaseApiJwt(
  requestMethod: string,
  url: string,
  requestPath: string,
) {
  const key_name = process.env.COINBASE_API_KEY_NAME;
  const key_secret = process.env.COINBASE_API_PRIVATE_KEY;

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
    },
  );

  return token;
}
