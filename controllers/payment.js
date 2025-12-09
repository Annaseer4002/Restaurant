import axios from "axios"
import Payment from "../models/payment.js";
import Order from "../models/order.js";

const orderPayment = async (req, res) => {
     try {
        const { orderId } = req.params;
        const userId = req.user.id
        
        // Verify order existence
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ status: 'fail', message: "Order not found" });
        }

        // check if the order belongs to the user
        if(order.userId.toString() !== userId){
            return res.status(403).json({ status: 'fail', message: "Unauthorized access to this order" });
        }

        // Initiate payment process
        const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
            email: req.user.email,
            // amount in kobo for NGN
            amount: order.totalAmount * 100,
            userId: userId,
            orderId: orderId,
            callback_url: `https://yourdomain.com/payments/callback`
            
        }, { 
            headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY }`}
        });

        
        // Save payment record
        const payment = new Payment({
            userId: userId,
            orderId: orderId,
            amount: order.totalAmount,
            reference: paymentResponse.data.data.reference,
            status: 'pending'
        })

        await payment.save();

        res.status(200).json({
            status: 'success',
            message: "Payment initiated",
            data: paymentResponse.data,
        });

     } catch (error) {
          res.status(500).json({
            status:'error',
            message: "Internal Server Error",
            error: error.message});
     }
}


const verifyPayment = async (req, res) => {
    // Implementation for payment verification
    const { reference } = req.params;

    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY }`
            }
        })
        
        if(response.data.status !== true){
            return res.status(400).json({ status: 'fail', message: "Payment verification failed" });
        }
        
        // Update payment record
        const updatePaymentStatus = await Payment.findByIdAndUpdate({ reference: reference }, {
            status: 'success',
            gatewayResponse: response.data.data.gateway_response
        }, { new: true });

        // Update order status to 'paid'
        const updateOrderStatus =
        await Order.findByIdAndUpdate(updatePaymentStatus.orderId, {
            paymentStatus: 'paid'
        });
     
        // Respond to client
        res.status(200).json({
            status: 'success',
            message: "Payment verified successfully",
            data: updatePaymentStatus
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Internal Server Error",
            error: error.message
        });
    }
}

const paymentController = {
    orderPayment,
    verifyPayment
}

export default paymentController;