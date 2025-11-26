import express from 'express'
import orderController from '../controllers/order.js';
import Authorize from '../middlewares/auth.js';

const router = express.Router();


router.post('/placeOrder', Authorize, orderController.placeOrder)