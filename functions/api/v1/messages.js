import { getDatabase, internalError, jsonResponse } from '../_shared.js';

export async function onRequestGet(context) {
  const database = getDatabase(context);
  if (!database) return jsonResponse({ detail: 'Database is unavailable.' }, 503);

  try {
    const result = await database.prepare(`
      SELECT sender, type, content, timestamp
      FROM (
        SELECT c.chat_id AS sender, m.type AS type,
          COALESCE(m.payload, '') AS content, m.created_at AS timestamp
        FROM messages m
        JOIN conversations c ON c.id = m.conversation_id
        UNION ALL
        SELECT COALESCE(NULLIF(email, ''), NULLIF(phone, ''), owner_name, 'Web form') AS sender,
          'text' AS type, pain_point AS content, created_at AS timestamp
        FROM prospects
      )
      ORDER BY timestamp DESC
      LIMIT 100
    `).all();
    return jsonResponse(result.results || []);
  } catch {
    return internalError();
  }
}