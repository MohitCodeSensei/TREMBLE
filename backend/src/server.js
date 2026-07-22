import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import ytMusicRoutes from './routes/ytMusicRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/ytmusic', ytMusicRoutes);

app.get('/', (req, res) => {
  res.send('TREMBLE Backend is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 TREMBLE Server running on port ${PORT}`);
});
