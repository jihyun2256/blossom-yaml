import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cartRouter from './routes/cart.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/readiness', (req, res) => res.json({ ready: true }));

app.use('/cart', cartRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'INTERNAL_SERVER_ERROR', error: err.message });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`cart-api listening on ${PORT}`));
