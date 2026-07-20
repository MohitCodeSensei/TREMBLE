import express from 'express';
import { getAllTracks, getTrackById, uploadTrack } from '../controllers/trackController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllTracks);
router.get('/:id', getTrackById);
router.post('/', authenticateToken, authorizeRole('artist'), uploadTrack);

export default router;
