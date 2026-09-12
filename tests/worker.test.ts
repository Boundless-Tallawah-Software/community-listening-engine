import assert from 'assert';
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

(async () => {
  // Test 1: no audio
  const form1 = new FormData();
  const request1 = new Request('https://example.com', {
    method: 'POST',
    body: form1
  });
  const resp1 = await worker.fetch(request1 as any, env as any, {} as any);
  assert.strictEqual(resp1.status, 400);
  const text1 = await resp1.text();
  assert(text1.includes('Missing audio'));

  // Test 2: process audio
  const blob = new Blob(['test'], { type: 'audio/webm' });
  const form2 = new FormData();
  form2.set('audio', blob);
  const request2 = new Request('https://example.com', {
    method: 'POST',
    body: form2
  });
  const resp2 = await worker.fetch(request2 as any, env as any, {} as any);
  assert.strictEqual(resp2.status, 200);
  const body2 = await resp2.json();
  assert(body2.hasOwnProperty('transcript'));
  assert(body2.hasOwnProperty('insights'));
  assert.strictEqual(env.DB.inserts.length, 1);

  console.log('All tests passed');
})();

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
  test('returns 400 if no audio file', async () => {
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

  test('processes audio and stores insight', async () => {
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
