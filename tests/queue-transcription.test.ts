import assert from "assert";
import consumer from "../src/queue-transcription.ts";

function buildMessage(body: unknown, attempts = 1) {
  return {
    id: `message-${attempts}`,
    timestamp: new Date(),
    body,
    attempts,
    ackCount: 0,
    retryOptions: [] as Array<{ delaySeconds?: number }>,
    ack() {
      this.ackCount += 1;
    },
    retry(options?: { delaySeconds?: number }) {
      this.retryOptions.push(options ?? {});
    },
  };
}

function buildEnv(options: { missingAudio?: boolean; failAi?: boolean; failD1?: boolean } = {}) {
  const writes: Array<{ sql: string; values: unknown[] }> = [];
  const env = {
    AI: {
      async run(_model: string, input: { audio: number[] }) {
        if (options.failAi || input.audio[0] === 2) throw new Error("AI unavailable");
        return { chat_transcript: "recognized words" };
      },
    },
    DB: {
      prepare(sql: string) {
        return {
          bind(...values: unknown[]) {
            return {
              async run() {
                if (options.failD1) throw new Error("D1 unavailable");
                writes.push({ sql, values });
              },
            };
          },
        };
      },
    },
    R2: {
      async get(key: string) {
        if (options.missingAudio || key === "missing") return null;
        const firstByte = key === "ai-failure" ? 2 : 1;
        return { async arrayBuffer() { return new Uint8Array([firstByte]).buffer; } };
      },
    },
    CACHE: {} as any,
    JOBS: {} as any,
  };
  return { env: env as any, writes };
}

async function runTests() {
  const success = buildMessage({ audioKey: "audio/one.webm", metadata: { sender: "123" } });
  const successContext = buildEnv();
  await consumer.queue!({ messages: [success] } as any, successContext.env, {} as any);
  assert.strictEqual(success.ackCount, 1);
  assert.strictEqual(success.retryOptions.length, 0);
  assert.strictEqual(successContext.writes.length, 1);
  assert(successContext.writes[0].sql.includes("ON CONFLICT(audio_key) DO UPDATE"));
  assert.deepStrictEqual(successContext.writes[0].values.slice(0, 3), [
    "audio/one.webm",
    "recognized words",
    JSON.stringify({ sender: "123" }),
  ]);

  const malformed = buildMessage({ audioKey: "", metadata: {} });
  await consumer.queue!({ messages: [malformed] } as any, successContext.env, {} as any);
  assert.strictEqual(malformed.ackCount, 0);
  assert.strictEqual(malformed.retryOptions.length, 1);

  const missingAudio = buildMessage({ audioKey: "missing", metadata: {} });
  await consumer.queue!({ messages: [missingAudio] } as any, buildEnv().env, {} as any);
  assert.strictEqual(missingAudio.retryOptions.length, 1);

  const mixedSuccess = buildMessage({ audioKey: "audio/two.webm", metadata: {} });
  const aiFailure = buildMessage({ audioKey: "ai-failure", metadata: {} }, 2);
  const mixedContext = buildEnv();
  await consumer.queue!({ messages: [mixedSuccess, aiFailure] } as any, mixedContext.env, {} as any);
  assert.strictEqual(mixedSuccess.ackCount, 1);
  assert.strictEqual(aiFailure.retryOptions.length, 1);
  assert.strictEqual(aiFailure.retryOptions[0].delaySeconds, 4);
  assert.strictEqual(mixedContext.writes.length, 1);

  const d1Failure = buildMessage({ audioKey: "audio/three.webm", metadata: {} });
  await consumer.queue!({ messages: [d1Failure] } as any, buildEnv({ failD1: true }).env, {} as any);
  assert.strictEqual(d1Failure.ackCount, 0);
  assert.strictEqual(d1Failure.retryOptions.length, 1);

  console.log("Queue transcription tests passed");
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
