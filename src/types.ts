import type { Ai, D1Database, R2Bucket, KVNamespace, Queue } from "@cloudflare/workers-types";

export interface Env {
  AI: Ai;
  DB: D1Database;
  R2: R2Bucket;
  CACHE: KVNamespace;
  JOBS: Queue;
}
