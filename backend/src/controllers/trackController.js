import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

export const getAllTracks = async (req, res) => {
  try {
    const [tracks] = await pool.execute(`
      SELECT t.*, a.username as artist_name
      FROM tracks t
      JOIN artists a ON t.artist_id = a.id
      JOIN users u ON a.user_id = u.id
    `);
    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tracks' });
  }
};

export const getTrackById = async (req, res) => {
  try {
    const { id } = req.params;
    const [tracks] = await pool.execute('SELECT * FROM tracks WHERE id = ?', [id]);
    if (tracks.length === 0) {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.json(tracks[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching track' });
  }
};

export const uploadTrack = async (req, res) => {
  try {
    const { title, duration, audio_url, cover_url, youtube_id } = req.body;
    const artistId = req.user.id; // This assumes we have user_id in JWT and they are an artist

    // First find the artist entry for this user
    const [artists] = await pool.execute('SELECT id FROM artists WHERE user_id = ?', [artistId]);
    if (artists.length === 0) {
      return res.status(403).json({ message: 'User is not registered as an artist' });
    }
    const artistIdPk = artists[0].id;

    const [result] = await pool.execute(
      'INSERT INTO tracks (artist_id, title, duration, audio_url, cover_url, youtube_id) VALUES (?, ?, ?, ?, ?, ?)',
      [artistIdPk, title, duration, audio_url, cover_url, youtube_id]
    );

    res.status(201).json({ message: 'Track uploaded successfully', trackId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading track' });
  }
};
