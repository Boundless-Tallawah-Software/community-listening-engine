import { getDatabase, internalError, jsonResponse } from '../../_shared.js';

export async function onRequestGet(context) {
  const database = getDatabase(context);
  if (!database) return jsonResponse({ detail: 'Database is unavailable.' }, 503);

  try {
    const stats = await database.prepare(`
      SELECT
        (SELECT COUNT(*) FROM messages) + (SELECT COUNT(*) FROM prospects) AS total_messages,
        (SELECT COUNT(*) FROM insights) AS total_insights,
        (SELECT COUNT(*) FROM (
          SELECT chat_id AS user_id FROM conversations
          UNION
          SELECT COALESCE(NULLIF(email, ''), NULLIF(phone, ''), id) AS user_id FROM prospects
        )) AS active_users
    `).first();
    return jsonResponse({
      total_messages: Number(stats?.total_messages || 0),
      total_insights: Number(stats?.total_insights || 0),
      active_users: Number(stats?.active_users || 0),
    });
  } catch {
    return internalError();
  }
}