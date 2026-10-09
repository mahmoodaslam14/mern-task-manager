import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';

const { PORT = 5000, MONGO_URI, CLIENT_ORIGIN = 'http://localhost:5173' } = process.env;

if (!MONGO_URI || !process.env.JWT_SECRET) {
  console.error('MONGO_URI and JWT_SECRET must be set. Copy .env.example to .env first.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

// Central error handler: validation errors become 400, everything else 500.
app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
