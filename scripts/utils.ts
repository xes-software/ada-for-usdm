import { readFileSync } from "fs";
import { resolve } from "path";

export function loadEnv(path = ".env") {
  const envPath = resolve(process.cwd(), path);
  const file = readFileSync(envPath, "utf8");

  const lines = file.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    const [key, ...vals] = line.split("=");
    const value = vals
      .join("=")
      .trim()
      .replace(/^["']|["']$/g, "");

    process.env[key.trim()] = value;
  }
}
