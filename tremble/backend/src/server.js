import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import trackRoutes from "./routes/trackRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => res.json({ app: "TREMBLE API", status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tracks", trackRoutes);

const PORT = process.env.PORT || 5000;
testConnection().then(() =>
  app.listen(PORT, () => console.log(`🚀 TREMBLE API on :${PORT}`))
);
