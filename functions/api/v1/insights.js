import { getDatabase, internalError, jsonResponse, parseInsight } from '../_shared.js';

export async function onRequestGet(context) {
  const database = getDatabase(context);
  if (!database) return jsonResponse({ detail: 'Database is unavailable.' }, 503);

  try {
    const result = await database.prepare(`
      SELECT id, transcript, payload, audio_key, created_at
      FROM insights
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
    return jsonResponse((result.results || []).map(parseInsight));
  } catch {
    return internalError();
  }
}