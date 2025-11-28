import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/readiness', (req, res) => res.json({ ready: true }));

// 추천 로직은 Redis 캐시를 활용하도록 구현 예정
app.get('/recommend/user/:userId', async (req, res) => {
  // 샘플 응답
  return res.json({ success: true, recommendations: [] });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'INTERNAL_SERVER_ERROR', error: err.message });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`recommend-api listening on ${PORT}`));
