import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true},

    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: true},

    items: [
        {
            menuId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Menu', 
                required: true },

            quantity: { 
                type: Number, 
                required: true, 
                default: 1}    
        }
    ],

    deliveryAddress: [{
        street: { type: String, required: true },
        contactNumber: { type: String, required: true}
    }],

    totalAmount: { 
        type: Number, 
        required: true },

    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'preparing', 'ready', 'out for delivey', 'delivered', 'cancelled'], 
        default: 'pending' },
        
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' }

}, { timestamps: true })


const Order = mongoose.model('Order', orderSchema);
export default Order;