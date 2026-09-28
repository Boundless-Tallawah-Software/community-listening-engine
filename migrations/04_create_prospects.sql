CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  owner_name TEXT,
  business_type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  industry TEXT,
  manual_process TEXT NOT NULL,
  pain_point TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prospects_created_at
  ON prospects (created_at DESC);