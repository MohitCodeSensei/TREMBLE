import express from 'express';
import { search, getSongDetails } from '../controllers/ytMusicController.js';

const router = express.Router();

router.get('/search', search);
router.get('/song/:videoId', getSongDetails);

export default router;
