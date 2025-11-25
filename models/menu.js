import mongoose  from "mongoose";

const menuSchema = new mongoose.Schema ({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },

    // ownerId: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'User',
    //     required: true
    // },

    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    availability: {
        type: Boolean,
        required: true
    },

    image: {
        type: String,
        required: true
    }

    
})


const Menu = mongoose.model('Menu', menuSchema)

export default Menu