import { pool } from "../config/db.js";

export async function getTracks(_, res) {
  const [rows] = await pool.query(
    `SELECT t.*, u.username AS artist_name
     FROM tracks t
     JOIN artists a ON t.artist_id = a.id
     JOIN users u ON a.user_id = u.id
     ORDER BY t.created_at DESC`
  );
  res.json(rows);
}

// Search endpoint — later proxies YouTube Music API keyword queries
export async function searchTracks(req, res) {
  const q = `%${req.query.q || ""}%`;
  const [rows] = await pool.query(
    "SELECT * FROM tracks WHERE title LIKE ? LIMIT 25",
    [q]
  );
  res.json(rows);
}
