export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function getDatabase(context) {
  return context.env?.DB;
}

export function internalError() {
  return jsonResponse({ detail: 'The request could not be completed.' }, 500);
}

export function textValue(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export function parseInsight(row) {
  let payload = {};
  try {
    payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  } catch {
    payload = {};
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) payload = {};

  return {
    id: row.id,
    source: payload.source || payload.channel || (row.audio_key ? 'Audio' : 'Conversation'),
    topic: payload.topic || payload.business_type || 'General',
    summary: payload.summary || payload.pain_point || row.transcript,
    sentiment: payload.sentiment || 'Unknown',
    timestamp: row.created_at,
  };
}