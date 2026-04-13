-- Developer Knowledge Hub - Database Schema
-- Run this file to create all required tables

CREATE DATABASE IF NOT EXISTS developer_knowledge_hub;
USE developer_knowledge_hub;

-- Categories table
CREATE TABLE my_personal_tracker_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE my_personal_tracker_topics (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES my_personal_tracker_categories(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE my_personal_tracker_notes (
  id VARCHAR(36) PRIMARY KEY,
  topic_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES my_personal_tracker_topics(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES my_personal_tracker_categories(id) ON DELETE CASCADE
);

-- Note blocks table (modular editor blocks)
CREATE TABLE my_personal_tracker_note_blocks (
  id VARCHAR(36) PRIMARY KEY,
  note_id VARCHAR(36) NOT NULL,
  type ENUM('text', 'code', 'heading', 'checklist') NOT NULL,
  content TEXT,
  language VARCHAR(50) DEFAULT NULL,
  checked BOOLEAN DEFAULT FALSE,
  block_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (note_id) REFERENCES my_personal_tracker_notes(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE my_personal_tracker_tags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(50) NOT NULL
);

-- Note-Tags junction table (many-to-many)
CREATE TABLE my_personal_tracker_note_tags (
  note_id VARCHAR(36) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES my_personal_tracker_notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES my_personal_tracker_tags(id) ON DELETE CASCADE
);

-- Note links table (wiki-style note linking)
CREATE TABLE my_personal_tracker_note_links (
  id VARCHAR(36) PRIMARY KEY,
  source_note_id VARCHAR(36) NOT NULL,
  target_note_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_note_id) REFERENCES my_personal_tracker_notes(id) ON DELETE CASCADE,
  FOREIGN KEY (target_note_id) REFERENCES my_personal_tracker_notes(id) ON DELETE CASCADE,
  UNIQUE (source_note_id, target_note_id)
);

-- Learning sessions table
CREATE TABLE my_personal_tracker_learning_sessions (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status ENUM('active', 'paused', 'completed') NOT NULL DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paused_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  total_duration_minutes INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES my_personal_tracker_categories(id) ON DELETE CASCADE
);

-- Learning progress tracking table
CREATE TABLE my_personal_tracker_learning_progress (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  note_id VARCHAR(36),
  progress_percentage INT DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES my_personal_tracker_learning_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (note_id) REFERENCES my_personal_tracker_notes(id) ON DELETE SET NULL
);

-- Time tracking table
CREATE TABLE my_personal_tracker_time_tracking (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  total_learning_minutes INT DEFAULT 0,
  sessions_count INT DEFAULT 0,
  category_id VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (date, category_id),
  FOREIGN KEY (category_id) REFERENCES my_personal_tracker_categories(id) ON DELETE SET NULL
);
