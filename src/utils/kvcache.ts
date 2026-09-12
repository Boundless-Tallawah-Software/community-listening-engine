// @ts-nocheck
// Simple KV cache helper for 5‑minute TTL caching of items.

import type { Env } from "../types";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function setCached<T>(env: Env, key: string, value: T): Promise<void> {
  const json = JSON.stringify({ value, expiresAt: Date.now() + CACHE_TTL_MS });
  await env.CACHE.put(key, json, { expirationTtl: CACHE_TTL_MS / 1000 });
}

export async function getCached<T>(env: Env, key: string): Promise<T | null> {
  const raw = await env.CACHE.get(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { value: T; expiresAt: number };
    if (Date.now() > parsed.expiresAt) {
      await env.CACHE.delete(key);
      return null;
    }
    return parsed.value;
  } catch {
    // malformed value – clear it
    await env.CACHE.delete(key);
    return null;
  }
}
