
import mongoose from  "mongoose";

const restaurantSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    restaurantName: {
        type: String,
        required: true,
        unique: true
    },

    location: {
        type: String,
        required: true
    },

    contact: {
        type: Number,
        required: true
    },

    menus: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu',
      required: false
    }],

    image: {
        type: String,
        required: false
    }
})


const Restaurant = mongoose.model('Restaurant', restaurantSchema)

export default Restaurant