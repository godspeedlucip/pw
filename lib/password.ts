import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 64;

function requireConfiguredSecret(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function hashPassword(plainText: string) {
  const salt = randomBytes(16);
  const derived = scryptSync(plainText, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });

  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export function verifyScryptPassword(plainText: string, encodedHash: string) {
  const parts = encodedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    throw new Error("Invalid ADMIN_PASSWORD_HASH format");
  }

  const [, nRaw, rRaw, pRaw, saltBase64, hashBase64] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    throw new Error("Invalid ADMIN_PASSWORD_HASH parameters");
  }

  const salt = Buffer.from(saltBase64, "base64");
  const expected = Buffer.from(hashBase64, "base64");

  const actual = scryptSync(plainText, salt, expected.length, { N, r, p });
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export function verifyAdminPassword(inputPassword: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return verifyScryptPassword(inputPassword, hash);
  }

  const fallbackPlain = process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "production") {
    requireConfiguredSecret(hash, "ADMIN_PASSWORD_HASH");
  }

  if (!fallbackPlain) {
    return false;
  }

  return timingSafeEqual(Buffer.from(inputPassword), Buffer.from(fallbackPlain));
}
