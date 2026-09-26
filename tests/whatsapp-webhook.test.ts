import { test, expect, vi } from "vitest";
import { default as worker } from "../src/webhook-worker";

// Mock Env bindings
const mockEnv = {
  R2: {
    put: vi.fn().mockResolvedValue(undefined),
  },
  JOBS: {
    enqueue: vi.fn().mockResolvedValue(undefined),
  },
  AI: { run: vi.fn().mockResolvedValue({ chat_transcript: "test" }) },
  DB: { prepare: vi.fn().mockReturnThis(), bind: vi.fn().mockReturnThis(), run: vi.fn().mockResolvedValue(undefined) },
  CACHE: { put: vi.fn(), get: vi.fn(), delete: vi.fn() },
};

function buildRequest(url: string, body: any) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("whatsapp webhook returns 200 for audio_url") {
  const req = buildRequest("https://test.local/whatsapp", {
    from: "12345",
    audio_url: "https://example.com/audio.webm",
  });

  // Mock fetch to return empty audio buffer
  global.fetch = vi.fn().mockResolvedValue({ arrayBuffer: () => new ArrayBuffer(10) });

  return worker.fetch(req, mockEnv, { waitUntil: () => {} } as any).then((res: any) => {
    expect(res.status).toBe(200);
    expect(mockEnv.R2.put).toHaveBeenCalled();
    expect(mockEnv.JOBS.enqueue).toHaveBeenCalled();
  });
}
