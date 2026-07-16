import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export async function register(req, res) {
  try {
    const { username, email, password, role = "user" } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?,?,?,?)",
      [username, email, hash, role]
    );
    if (role === "artist") {
      await pool.query("INSERT INTO artists (user_id) VALUES (?)", [r.insertId]);
    }
    res.status(201).json({ id: r.insertId, username, role });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
