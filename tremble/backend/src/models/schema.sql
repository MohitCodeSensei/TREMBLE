-- TREMBLE Database Schema
CREATE DATABASE IF NOT EXISTS tremble
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tremble;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user','artist') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ARTISTS
CREATE TABLE IF NOT EXISTS artists (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  bio             TEXT,
  verified_status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_artist_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- TRACKS
CREATE TABLE IF NOT EXISTS tracks (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  artist_id  BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255) NOT NULL,
  duration   INT UNSIGNED,             -- seconds
  audio_url  VARCHAR(500),
  cover_url  VARCHAR(500),
  youtube_id VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_track_artist FOREIGN KEY (artist_id)
    REFERENCES artists(id) ON DELETE CASCADE,
  INDEX idx_track_title (title)
);

-- PLAYLISTS
CREATE TABLE IF NOT EXISTS playlists (
  id         BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  name       VARCHAR(255) NOT NULL,
  is_public  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_playlist_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- LIKES (composite PK prevents duplicate likes)
CREATE TABLE IF NOT EXISTS likes (
  user_id  BIGINT UNSIGNED NOT NULL,
  track_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (user_id, track_id),
  CONSTRAINT fk_like_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_like_track FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);

-- DOWNLOADS
CREATE TABLE IF NOT EXISTS downloads (
  user_id       BIGINT UNSIGNED NOT NULL,
  track_id      BIGINT UNSIGNED NOT NULL,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, track_id, downloaded_at),
  CONSTRAINT fk_dl_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_dl_track FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
);