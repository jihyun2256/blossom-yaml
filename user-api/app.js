import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/readiness', (req, res) => res.json({ ready: true }));

app.use('/users', usersRouter);

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'INTERNAL_SERVER_ERROR', error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`user-api listening on ${PORT}`));
