const IS_HTTPS_ENFORCED =
  process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS === "true";
const AUTH_COOKIE = IS_HTTPS_ENFORCED ? "__Host-admin_session" : "admin_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 12;

type TokenPayload = {
  email: string;
  iat: number;
  exp: number;
};

function getSecretBytes() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is required and must be at least 32 characters in production");
    }
    return new TextEncoder().encode("dev-only-insecure-auth-secret-change-me");
  }

  return new TextEncoder().encode(secret);
}

function toBinary(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => String.fromCharCode(byte))
    .join("");
}

function fromBinary(binary: string) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(input: Uint8Array) {
  const base64 = btoa(toBinary(input));
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return fromBinary(atob(padded));
}

async function signRaw(message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    getSecretBytes(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return base64UrlEncode(new Uint8Array(signature));
}

async function verifyRaw(message: string, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    getSecretBytes(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  return await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(signature),
    new TextEncoder().encode(message)
  );
}

export const authConfig = {
  cookieName: AUTH_COOKIE,
  maxAge: TOKEN_TTL_SECONDS
};

export type AuthPayload = {
  email: string;
};

export async function signAuthToken(payload: AuthPayload) {
  const now = Math.floor(Date.now() / 1000);
  const data: TokenPayload = {
    email: payload.email,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS
  };

  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify(data)));
  const unsigned = `${header}.${body}`;
  const signature = await signRaw(unsigned);

  return `${unsigned}.${signature}`;
}

export async function verifyAuthToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token");
  }

  const [header, body, signature] = parts;
  const unsigned = `${header}.${body}`;
  const valid = await verifyRaw(unsigned, signature);

  if (!valid) {
    throw new Error("Invalid signature");
  }

  const payloadJson = new TextDecoder().decode(base64UrlDecode(body));
  const payload = JSON.parse(payloadJson) as TokenPayload;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) {
    throw new Error("Token expired");
  }

  return { email: payload.email };
}

