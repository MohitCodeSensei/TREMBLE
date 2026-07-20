import express from 'express';
import { login, artistLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/artist/login', artistLogin);

export default router;
