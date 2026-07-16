import { Router } from "express";
import { getTracks, searchTracks } from "../controllers/trackController.js";
const router = Router();
router.get("/", getTracks);
router.get("/search", searchTracks);
export default router;
