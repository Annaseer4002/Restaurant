import axios from "axios"
import Payment from "../models/payment.js";
import Order from "../models/order.js";
import User from "../models/auth.js";
import sendMail from "../utils/sendMails.js";

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
        const updatePaymentStatus = await Payment.findOneAndUpdate({ reference: reference }, {
            status: 'success',
            gatewayResponse: response.data.data.gateway_response
        }, { new: true });

           if(!updatePaymentStatus){
            return res.status(404).json({
                status: 'fail',
                message: 'Invalid reference, Payment not found',
                error: error.message 
            })
        }
        


        // Find the payment record
        // const payment = await Payment.findOne({reference: reference})
     
        // // Update payment status
        // payment.status = 'success';

        // // Add gateway response
        // payment.gatewayResponse = response.data.data.gateway_response;

        // // Save updated payment
        // const updatePaymentStatus = await payment.save();

        
        // Update order status to 'paid'
        const updateOrderStatus =
        await Order.findByIdAndUpdate(updatePaymentStatus.orderId, {
            paymentStatus: 'paid'
        });

        if(!updateOrderStatus){
            return res.status(404).json({
                status: 'fail',
                message: 'Order associated with this payment not found',
            })
        }


        // find user associated with the order
        const user = await User.findById(updatePaymentStatus.userId);
        if(!user){
            return res.status(404).json({
                status: 'fail',
                message: 'User associated with this payment not found',
            })
        }

        // Here you can send a confirmation email to the user using your preferred email service
        await sendMail ({
            to: user.email,
            subject: 'Payment Successful',
            text: `Dear ${user.fullname}, your payment for order ${updateOrderStatus._id} has been successfully processed.`,
            html: `<p>Dear ${user.fullname},</p><p>Your payment for order <strong>${updateOrderStatus._id}</strong> has been successfully processed.</p><p>Thank you for shopping with us!</p>`
        })
     
        // Respond to client
        res.status(200).json({
            status: 'success',
            message: "Payment verified successfully",
            data: {
                "paymentStatus": updatePaymentStatus?.status,
                "orderStatus": updateOrderStatus?.paymentStatus
            }
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