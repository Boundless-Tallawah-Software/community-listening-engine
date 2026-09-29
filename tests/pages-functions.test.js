import assert from 'assert';
import { onRequestGet as getBanner } from '../functions/api/banner-message.js';
import { onRequestPost as createProspect } from '../functions/api/prospects.js';
import { onRequestGet as getStats } from '../functions/api/v1/dashboard/stats.js';
import { onRequestGet as getMessages } from '../functions/api/v1/messages.js';
import { onRequestGet as getInsights } from '../functions/api/v1/insights.js';

class TestResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = options.headers || {};
  }

  async json() {
    return JSON.parse(this.body);
  }
}

globalThis.Response = TestResponse;
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = { randomUUID: () => 'test-prospect-id' };
}

class FakeD1 {
  inserts = [];
  fail = false;

  prepare(sql) {
    const statement = {
      values: [],
      bind: (...values) => {
        statement.values = values;
        return statement;
      },
      run: async () => {
        if (this.fail) throw new Error('database failure');
        this.inserts.push({ sql, values: statement.values });
      },
      first: async () => ({ total_messages: 4, total_insights: 2, active_users: 3 }),
      all: async () => ({ results: [{ sender: 'owner@example.com', type: 'form', content: 'Improve scheduling', timestamp: '2026-09-28' }] }),
    };
    return statement;
  }
}

const responseBody = async (response) => response.json();
const formData = {
  owner_name: 'Owner',
  business_type: 'Restaurant',
  email: 'owner@example.com',
  phone: '',
  industry: 'Hospitality',
  manual_process: 'Manual scheduling',
  pain_point: 'Too much time spent coordinating shifts',
};
const database = new FakeD1();
const env = { DB: database };

async function main() {
const invalidResponse = await createProspect({
  request: {
    headers: { get: () => 'application/json' },
    json: async () => ({ business_type: 'Restaurant' }),
  },
  env,
});
assert.strictEqual(invalidResponse.status, 400);
assert.strictEqual(database.inserts.length, 0);

const createdResponse = await createProspect({
  request: {
    headers: { get: () => 'application/json' },
    json: async () => formData,
  },
  env,
});
assert.strictEqual(createdResponse.status, 201);
assert.strictEqual(database.inserts.length, 1);
assert(database.inserts[0].sql.includes('INSERT INTO prospects'));
assert.strictEqual(typeof database.inserts[0].values[0], 'string');

const banner = await responseBody(getBanner({ env: { INFORMATION_MESSAGE: 'Configured banner' } }));
assert.strictEqual(banner.message, 'Configured banner');

const stats = await responseBody(await getStats({ env }));
assert.deepStrictEqual(stats, { total_messages: 4, total_insights: 2, active_users: 3 });

const messages = await responseBody(await getMessages({ env }));
assert.strictEqual(messages[0].content, 'Improve scheduling');

const insightContext = {
  env: {
    DB: {
      prepare: () => ({
        all: async () => ({
          results: [{
            id: 7,
            transcript: 'Transcript fallback',
            payload: JSON.stringify({ summary: 'Improve scheduling', sentiment: 'Positive' }),
            audio_key: null,
            created_at: '2026-09-28',
          }],
        }),
      }),
    },
  },
};
const insights = await responseBody(await getInsights(insightContext));
assert.strictEqual(insights[0].summary, 'Improve scheduling');
assert.strictEqual(insights[0].sentiment, 'Positive');

database.fail = true;
const failedResponse = await createProspect({
  request: {
    headers: { get: () => 'application/json' },
    json: async () => formData,
  },
  env,
});
assert.strictEqual(failedResponse.status, 500);
assert.deepStrictEqual(await responseBody(failedResponse), {
  detail: 'The request could not be completed.',
});

console.log('Pages Functions tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});