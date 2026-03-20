import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-admin-password.mjs <password>");
  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;
const keyLen = 64;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, keyLen, { N, r, p });

const encoded = `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
console.log(encoded);
