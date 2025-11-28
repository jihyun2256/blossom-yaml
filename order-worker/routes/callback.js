import express from 'express';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, TABLES } from '/usr/src/shared/dynamodb.js';
import axios from 'axios';

const router = express.Router();

router.post('/callback', async (req, res) => {
  try {
    const { user_id, order_id, payment_method, amount, items } = req.body;
    if (!user_id || !order_id || !payment_method) return res.status(400).json({ success: false, message: 'MISSING_FIELDS' });

    // 1) DynamoDB에 결제 정보 저장
    const paymentId = `payment-${Date.now()}`;
    const paymentStatus = 'completed';

    const paymentCommand = new PutCommand({
      TableName: TABLES.PAYMENT,
      Item: {
        payment_id: paymentId,
        user_id: String(user_id),
        order_id: String(order_id),
        payment_method,
        amount,
        status: paymentStatus,
        transaction_id: `TXN-${Date.now()}`,
        created_at: new Date().toISOString(),
      }
    });

    await dynamoDB.send(paymentCommand);

    // 2) order-api에 내부 호출로 주문 상태 업데이트 (Kubernetes ClusterIP 사용 가정)
    const orderApiUrl = process.env.ORDER_API_URL || 'http://order-api:3003';
    try {
      await axios.patch(`${orderApiUrl}/orders/${order_id}/status`, { status: 'paid', payment_id: paymentId });
    } catch (callErr) {
      console.error('Failed to notify order-api:', callErr.message);
      // 실패 시 재시도 로직 또는 DLQ로 보낼 수 있음 (여기서는 500 반환)
      return res.status(500).json({ success: false, message: 'ORDER_UPDATE_FAILED', error: callErr.message });
    }

    return res.json({ success: true, payment_id: paymentId, status: paymentStatus });
  } catch (err) {
    console.error('Callback processing error:', err);
    return res.status(500).json({ success: false, message: 'SERVER_ERROR', error: err.message });
  }
});

export default router;
