import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: "NGN"
  },

  paymentMethod: {
    type: String,
    default: "paystack"
  },

  reference: {
    type: String,
    required: true,
    unique: true
  },

  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },


  gatewayResponse: String,

}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;