import Menu from "../models/menu.js";
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

        await sendMail({
            to: req.user.email,
            subject: 'Order Confirmation',
            html: `<p>Dear ${req.user.name},</p>
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
