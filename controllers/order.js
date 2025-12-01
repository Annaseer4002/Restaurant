import User from "../models/auth.js";
import Menu from "../models/menu.js";
import Order from "../models/order.js";
import Restaurant from "../models/restaurant.js";
import sendMail from "../utils/sendMails.js";

const placeOrder = async (req, res) => {
    // Implementation for placing an order
    const { restaurantId, items, deliveryAddress } = req.body;
    const userId = req.user.id

    if(!userId){
        return res.status(401).json({
            status: 'fail',
            message: 'Unauthorized. Please log in to place an order.'
        });
    }

  

    if(!restaurantId || !deliveryAddress || !items || items.length === 0){
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide all required fields: restaurantId, items, deliveryAddress'
        });
    }

    try {
        // Verify restaurant exists
        const restaurant = await Restaurant.findById(restaurantId);
        if(!restaurant){
            return res.status(404).json({
                status: 'fail',
                message: 'Restaurant not found'
            });
        }


        // extract menuIds from items
        const menuIds = items.map(item => item.menuId);

        // Fetch menu details from database
        const menus = await Menu.find({_id: { $in: menuIds}})

        if(menus.length !== menuIds.length){
            return res.status(404).json({
                status: 'fail',
                message: 'One or more menu items not found'
            });
        }

        // check if menus belong to the specified restaurant
        menus.forEach(menu => {
            if(menu.restaurantId.toString() !== restaurantId){
                return res.status(400).json({
                    status: 'fail',
                    message: `Menu item ${menu._id} does not belong to ${restaurant.restaurantName} restaurant.
                    cannot place order from multiple restaurants.`
                })
            }
        })

        // check if the menus are available
        const unavailableMenus = menus.filter(menu => menu.availability === false)
        if(unavailableMenus.length > 0){
            return res.status(400).json({
                status: 'fail',
                message: `One or more menu items are currently unavailable: ${unavailableMenus.map(menu => menu._id).join(', ')}`
            });
        }

        
        // calculate total amount
        let totalAmount = 0

        // validate each item and calculate total amount
        items.forEach(item => {

            // find menu id from array of menus and compare with item menuId
            const menu = menus.find(menu => menu._id.toString() === item.menuId);

            if(!menu){
                return res.status(404).json({
                    status: 'fail',
                    message: `Menu item with id ${item.menuId} not found`
                });
            }

            // calculate total amount
            totalAmount += menu.price * item.quantity;
        })

        // create new order
        const order = new Order({
            userId,
            restaurantId,
            items,
            deliveryAddress,
            totalAmount,
            
        })

        await order.save();


        // const user = await User.findById(req.user.id)

        await sendMail({
            to: req.user.email,
            subject: 'Order Confirmation',
            html: `<p>Dear ${req.user.fullname},</p>
            <p>Your order from <strong>${restaurant.restaurantName}</strong> has been placed successfully.</p>
            <p><strong>Total Amount:</strong> $${totalAmount}</p>
            <p>Thank you for ordering with us!</p>`,
            text: `Dear ${req.user.name},\n\nYour order from ${restaurant.restaurantName} has been placed successfully. 
            Total Amount: $${totalAmount}.\n\nThank you for ordering with us!\n`
        })

        res.status(201).json({
            status: 'success',
            message: 'Order placed successfully',
            data: order
        });







    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }

    
}


const getOrders = async (req, res)=>{
   
    try {
        
        // confirm the user is admin
            if(req.user.role !== 'admin'){
        return res.status(403).json({
            status: 'fail',
            message: 'Access Denied, Only admin can fetched all orders'
        })
    }

    // find orders
    const orders = await Order.find().populate('userId', 'fullname email').populate('restaurantId', 'restaurantName location')


    if(!orders || orders.length === 0){
        return res.status(404).json({
            status: 'fail',
            message: ''
        })
    }

 
    res.status(200).json({
        status: 'success',
        message: 'Orders fetched successfully',
        data: orders
    })


        
    } catch (error) {
        return res.status(500).json({
            status:'error',
            message: 'Internal server error',
            error: error.message

        })
    }
    
}


const getOrder = async (req, res)=> {
    const {id } = req.params

    try {

        const order = await Order.findById(id).populate('userId', 'fullname email').populate('restaurantId', 'restaurantName location')

        if(!order){
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found.'
            })
        }

        // if(req.user.id !== order.userId || req.user.role !== 'admin'){

        // }

        res.status(200).json({
            status: 'success',
            message: 'Order fetched successfully',
            data: order
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message:'Internal server error',
            error: error.message
        })
    }
}


const myOrder = async (req, res) => {

    
    // const { userId } = req.params
    const userId = req.user.id

    try {

        
    if(!req.user){
       return res.status(403).json({
        status:'fail',
        message: 'Unauthorized. Please log in to view your orders.'
       })
    }

   

    // const orders = await Order.find(req.user.id)
    const orders = await Order.find({ userId: userId})
    .populate('restaurantId', 'restaurantName location')
    .populate('items.menuId', 'name price')

    if(!orders || orders.length === 0){
        return res.status(404).json({
            status: 'fail',
            message: 'No available orders yet.'
        })
    }

    res.status(200).json({
        status: 'success',
        message: 'orders fetched successfully',
        data: orders
    })
        
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        })
    }
}



const restaurantOrders = async (req, res) => {
    const { id } = req.params


    try {

        
    // check if the user is log in
    if(!req.user){
         return res.status(403).json({
             status:'fail',
             message: 'Unauthorized. Please log in.'
         })
    }

    //Find restaurant
    const restaurant = await Restaurant.findById(id)
    if(!restaurant){
        return res.status(404).json({
            status: 'fail',
            message: 'Restaurant not found'
        })
    }

    // confirm the user is the restaurant owner
    if(restaurant.ownerId.toString() !== req.user.id){
          return res.status(404).json({
            status: 'fail',
            message: 'Access Denied, only Restaurant owner can view Restauran orders'
        })
    }


    //find orders
    const orders = await Order.find({ restaurantId: id})
    .populate('userId', 'fullname email')
    .populate('items.menuId', 'name price')
    if(!orders || orders.length === 0){
        return res.status(404).json({
            status: 'fail',
            message: 'orders not found'
        })
    }


    res.status(200).json({
        status: 'success',
        message: 'successfullt fetched restaurant orders',
        data: orders
    })
        
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: "Internal server error",
            error: error.message
        })
    }
}



const updateOrderStatus = async (req, res)=> {
    const { id } = req.params
    const { status } = req.body


    try {

        // find order by id
        const order = await Order.findById(id)

        if(!order){
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            })
        }

      // find the restaurant which the order belongs to
        const restaurant = await Restaurant.findById(order.restaurantId)

        if(!restaurant){
              return res.status(404).json({
                status: 'fail',
                message: 'Restaurant not found'
            })
        }

        // Allows only admin & restaurant Owner to update status
        if(restaurant.ownerId.toString() !== req.user.id ){
             return res.status(403).json({
                status: 'fail',
                message: 'Unauthorized Access, Cannot update order status'
             })
        }

     // update the status
     const updateOrderStatus = await Order.findByIdAndUpdate(id,{status}, {new: true})

     res.status(200).json({
        status: 'success',
        message: 'Order status updated successfully',
        date: updateOrderStatus
     })


    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        })
    }
}


const cancelOrder = async (req, res) => {
    const { id } = req.params
 
    // check if user is logged in
    if(!req.user){
        return res.status(403).json({
            status: 'fail',
            message: 'Unauthorized. Please log in to cancel order'
        })
    }

    try {
        // find order by id
        const order = await Order.findById(id)

        if(!order){
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            })
        }

        // check if the order belongs to the user
        if(order.userId.toString() !== req.user.id){
            return res.status(403).json({
                status: 'fail',
                message: 'Access Denied, cannot cancel order'
            })
        }

        // check if order status is pending or accepted
        if(order.status === 'pending'){
            return res.status(400).json({
                status: 'fail',
                message: `Cannot cancel order with status ${order.status}`
            })
        }

        // update order status to cancelled
        const cancelledOrder = await Order.findByIdAndUpdate(id, { status: 'cancelled'}, { new: true})

        res.status(200).json({
            status: 'success',
            message: 'Order cancelled successfully',
            data: cancelledOrder
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        })
    }
}

const deleteOrder = async (req, res) => {
    const { id } = req.params
    
    // check if user is logged in & is admin
    if(!req.user && req.user.role !== 'admin'){
        return res.status(403).json({
            status: 'fail',
            message: 'Access Denied, only admin can delete orders'
        })
    }

    try {
        // find order by id and delete
        const order = await Order.findByIdAndDelete(id)
        if(!order){
            return res.status(404).json({
                status: 'fail',
                message: 'Order not found'
            })
        }

        res.status(200).json({
            status: 'success',
            message: 'Order deleted successfully'
        })

    } catch (error){
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        })
    }
}

const orderController = {
    placeOrder,
    getOrders,
    getOrder,
    myOrder,
    restaurantOrders,
    updateOrderStatus,
    cancelOrder,
    deleteOrder
}

export default orderController;