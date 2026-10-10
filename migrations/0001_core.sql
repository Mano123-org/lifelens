CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  due_at TEXT,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Uncategorized',
  minutes INTEGER NOT NULL CHECK (minutes > 0),
  started_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  occurred_on TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS network_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL CHECK (source IN ('computer-agent', 'mobile-app', 'browser-extension')),
  device_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  hostname TEXT,
  bytes_sent INTEGER NOT NULL DEFAULT 0 CHECK (bytes_sent >= 0),
  bytes_received INTEGER NOT NULL DEFAULT 0 CHECK (bytes_received >= 0),
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_usage_started_at ON usage_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_transactions_occurred_on ON transactions(occurred_on);
CREATE INDEX IF NOT EXISTS idx_network_events_occurred_at ON network_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_network_events_device_id ON network_events(device_id);