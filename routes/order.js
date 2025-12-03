import express from 'express'
import orderController from '../controllers/order.js';
import Authorize from '../middlewares/auth.js';

const router = express.Router();


router.post('/placeOrder', Authorize, orderController.placeOrder)
router.get('/getOrders', Authorize, orderController.getOrders)
router.get('/getOrder/:id', orderController.getOrder)
router.get('/myOrders', Authorize, orderController.myOrder)
router.get('/restaurantOrders/:id', Authorize, orderController.restaurantOrders)
router.patch('/updateOrderStatus/:id', Authorize, orderController.updateOrderStatus)
router.patch('/cancelOrder/:id', Authorize, orderController.cancelOrder)
router.get('/orderStatus/:id', Authorize, orderController.trackOrder)
router.delete('/deleteOrder/:id', Authorize, orderController.deleteOrder)
 

export default router;