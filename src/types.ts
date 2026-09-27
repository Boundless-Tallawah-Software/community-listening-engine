import type { Ai, D1Database, R2Bucket, KVNamespace, Queue } from "@cloudflare/workers-types";

export interface TranscriptionQueueMessage {
  audioKey: string;
  metadata: Record<string, unknown>;
}

export interface Env {
  AI: Ai;
  DB: D1Database;
  R2: R2Bucket;
  CACHE: KVNamespace;
  JOBS: Queue<TranscriptionQueueMessage>;
}

export type TranscriptionEnv = Pick<Env, "AI" | "DB" | "R2">;
