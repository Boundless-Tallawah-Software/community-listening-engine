SELECT CASE WHEN
  (
    EXISTS (
      SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'insights'
    )
    AND (
      SELECT COUNT(*) FROM pragma_table_info('insights')
      WHERE name IN ('id', 'transcript', 'payload', 'created_at')
    ) != 4
  )
  OR (
    (
      EXISTS (
        SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'conversations'
      )
      OR EXISTS (
        SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'messages'
      )
    )
    AND (
      NOT EXISTS (
        SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'conversations'
      )
      OR NOT EXISTS (
        SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'messages'
      )
      OR (
        SELECT COUNT(*) FROM pragma_table_info('conversations')
        WHERE name IN ('id', 'chat_id', 'created_at')
      ) != 3
      OR (
        SELECT COUNT(*) FROM pragma_table_info('messages')
        WHERE name IN ('id', 'conversation_id', 'type', 'payload', 'created_at')
      ) != 5
    )
  )
  OR (
    EXISTS (
      SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'transcriptions'
    )
    AND (
      SELECT COUNT(*) FROM pragma_table_info('transcriptions')
      WHERE name IN ('audio_key', 'transcript', 'metadata', 'created_at')
    ) != 4
  )
  OR (
    (
      EXISTS (
        SELECT 1 FROM pragma_table_info('insights') WHERE name = 'audio_key'
      )
      OR EXISTS (
        SELECT 1 FROM pragma_index_list('insights')
        WHERE name = 'idx_insights_audio_key'
      )
    )
    AND NOT (
      EXISTS (
        SELECT 1 FROM pragma_table_info('insights') WHERE name = 'audio_key'
      )
      AND EXISTS (
        SELECT 1 FROM pragma_index_list('insights')
        WHERE name = 'idx_insights_audio_key' AND "unique" = 1
      )
      AND EXISTS (
        SELECT 1 FROM pragma_index_info('idx_insights_audio_key')
        WHERE name = 'audio_key'
      )
    )
  )
THEN 1 ELSE 0 END AS has_partial_schema;
