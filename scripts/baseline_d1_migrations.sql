CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT OR IGNORE INTO d1_migrations (name)
SELECT '00_create_tables.sql'
WHERE EXISTS (
  SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'insights'
)
AND (
  SELECT COUNT(*) FROM pragma_table_info('insights')
  WHERE name IN ('id', 'transcript', 'payload', 'created_at')
) = 4;

INSERT OR IGNORE INTO d1_migrations (name)
SELECT '01_add_conversation_tables.sql'
WHERE EXISTS (
  SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'conversations'
)
AND EXISTS (
  SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'messages'
)
AND (
  SELECT COUNT(*) FROM pragma_table_info('conversations')
  WHERE name IN ('id', 'chat_id', 'created_at')
) = 3
AND (
  SELECT COUNT(*) FROM pragma_table_info('messages')
  WHERE name IN ('id', 'conversation_id', 'type', 'payload', 'created_at')
) = 5;

INSERT OR IGNORE INTO d1_migrations (name)
SELECT '02_create_transcriptions.sql'
WHERE EXISTS (
  SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'transcriptions'
)
AND (
  SELECT COUNT(*) FROM pragma_table_info('transcriptions')
  WHERE name IN ('audio_key', 'transcript', 'metadata', 'created_at')
) = 4;

INSERT OR IGNORE INTO d1_migrations (name)
SELECT '03_add_audio_key_to_insights.sql'
WHERE EXISTS (
  SELECT 1 FROM pragma_table_info('insights') WHERE name = 'audio_key'
)
AND EXISTS (
  SELECT 1 FROM pragma_index_list('insights')
  WHERE name = 'idx_insights_audio_key' AND "unique" = 1
)
AND EXISTS (
  SELECT 1 FROM pragma_index_info('idx_insights_audio_key')
  WHERE name = 'audio_key'
);
