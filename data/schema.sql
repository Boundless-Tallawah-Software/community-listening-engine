# Core Database Schema - Community Listening Engine
# Version: v1.0 (Initial Implementation)
# Target: SQLite

PRAGMA foreign_keys = ON;

-- 1. OWNER/PROSPECT DIRECTORY
-- Stores the primary identity of people being monitored.
CREATE TABLE IF NOT EXISTS prospects (
    id TEXT PRIMARY KEY,             -- UUID generated at client-side
    name TEXT NOT NULL,
    contact_info TEXT,               -- WhatsApp number, Email, etc.
    source TEXT,                     -- e.g., 'WhatsApp', 'Manual'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. CONVERSATION LOGS (THE "LISTENING" LAYER)
-- Stores the raw text/transcription from all multi-channel inputs.
CREATE TABLE IF NOT_EXISTS conversation_logs (
    id TEXT PRIMARY KEY,             -- UUID
    prospect_id TEXT NOT NULL,       -- FK to prospects
    input_method TEXT NOT NULL,      -- 'text' or 'voice'
    raw_content TEXT NOT NULL,       -- The raw message string or transcription
    audio_file_path TEXT,            -- Path to .webm/.m4a if 'voice'
    extraction_json TEXT,            -- JSON payload from Ollama (Pain points, etc.)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE
);

-- 3. ANALYTICS & ENGAGEMENT TRACKING
-- Tracks interaction metrics to identify friction/drop-off.
CREATE TABLE IF NOT EXISTS engagement_analytics (
    id TEXT PRIMARY KEY,
    prospect_id TEXT NOT NULL,       -- FK to prospects
    interaction_type TEXT NOT NULL,  -- 'inbound' or 'outbound'
    device_type TEXT NOT NULL,       -- 'web' or 'mobile'
    session_duration INTEGER,        -- seconds (if applicable)
    is_successful BOOLEAN DEFAULT 1, -- tracking completion/drop-off
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE
);

-- 4. SETTINGS & CONFIGURATION
-- Stores system-wide settings like retention and branding.
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Initial Seed for Settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('voice_retention_days', '7');
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('brand_primary_color', '[BRAND_COLOR_PRIMARY]');
