import express from 'express'
import paymentController from '../controllers/payment.js'
import Authorize from '../middlewares/auth.js';

const router = express.Router()

router.post('/initiate/:orderId', Authorize, paymentController.orderPayment)
router.get('/verify/:reference', paymentController.verifyPayment)
export default router;