type LimitState = {
  attempts: number[];
  blockedUntil: number;
};

const store = new Map<string, LimitState>();

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

function now() {
  return Date.now();
}

function compact(state: LimitState, nowMs: number) {
  state.attempts = state.attempts.filter((ts) => nowMs - ts <= WINDOW_MS);
}

export function checkLoginRateLimit(key: string) {
  const nowMs = now();
  const state = store.get(key);

  if (!state) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  compact(state, nowMs);

  if (state.blockedUntil > nowMs) {
    const retryAfterSeconds = Math.ceil((state.blockedUntil - nowMs) / 1000);
    return { blocked: true, retryAfterSeconds };
  }

  return { blocked: false, retryAfterSeconds: 0 };
}

export function registerLoginFailure(key: string) {
  const nowMs = now();
  const state = store.get(key) || { attempts: [], blockedUntil: 0 };

  compact(state, nowMs);
  state.attempts.push(nowMs);

  if (state.attempts.length >= MAX_ATTEMPTS) {
    state.blockedUntil = nowMs + BLOCK_MS;
    state.attempts = [];
  }

  store.set(key, state);
}

export function clearLoginFailures(key: string) {
  store.delete(key);
}
