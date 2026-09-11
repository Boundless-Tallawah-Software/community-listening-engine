import { jest } from '@jest/globals';

// Placeholder for D1 stub
class FakeD1 {
  private inserts: any[] = [];
  async prepare(sql: string) {
    const self = this;
    return {
      bind: (...args: any[]) => ({
        run: async () => {
          self.inserts.push({ sql, args });
        }
      })
    };
  }
  get inserts() { return this.inserts; }
}

// Mock Env
const env = {
  AI: {},
  DB: new FakeD1() as any,
  R2: {} as any,
  CACHE: {} as any,
  JOBS: {} as any
} as any;

// Import the worker
import worker from '../src/webhook-worker.ts';

describe('webhook-worker', () => {
  it('returns 400 if no audio file', async () => {
    const form = new FormData();
    const request = new Request('https://example.com', {
      method: 'POST',
      body: form
    });
    const resp = await worker.fetch(request as any, env as any, {} as any);
    expect(resp.status).toBe(400);
    const text = await resp.text();
    expect(text).toContain('Missing audio');
  });

  it('processes audio and stores insight', async () => {
    const blob = new Blob(['test'], { type: 'audio/webm' });
    const form = new FormData();
    form.set('audio', blob);
    const request = new Request('https://example.com', {
      method: 'POST',
      body: form
    });
    const resp = await worker.fetch(request as any, env as any, {} as any);
    expect(resp.status).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('transcript');
    expect(body).toHaveProperty('insights');
    expect(env.DB.inserts.length).toBe(1);
  });
});
