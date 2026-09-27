ALTER TABLE insights ADD COLUMN audio_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_insights_audio_key
  ON insights (audio_key);
