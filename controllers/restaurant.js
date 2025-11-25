import Restaurant from "../models/restaurant.js"
import sendMail from "../utils/sendMails.js";

const createRestaurant = async (req, res) => {
  try {
    // Extract owner ID from decoded token
    const ownerId = req.user.id;

    const { restaurantName, location, contact, menus, image } = req.body;

    if(!restaurantName || !location || !contact){
      return res.status(400).json({
        status: "fail",
        message: "restaurant name, location and contact are required" 
      }); 
    }

    // 1. Only owners can create restaurants
    if (req.user.role !== "owner") {
      return res.status(403).json({
        status: "fail",
        message: "Access denied. Only restaurant owners can create a restaurant."
      });
    }

    // 2. Check if the user already has a restaurant
    const haveOne = await Restaurant.findOne({ ownerId });
    if (haveOne) {
      return res.status(400).json({
        status: "fail",
        message: "You already created a restaurant."
      });
    }

    // 3. Check if restaurant name already exists
    const existingName = await Restaurant.findOne({ restaurantName });
    if (existingName) {
      return res.status(400).json({
        status: "fail",
        message: "Restaurant name already exists."
      });
    }

    // 4. Create new restaurant
    const restaurant = new Restaurant({
      ownerId,
      restaurantName,
      location,
      contact,
      image,
      menus
    });

    await restaurant.save();

    // await sendMail({
    //   to: email,
    //   subject: 'Restaurant Creation',
    //   html: ``,
    //   text:
    // })

    return res.status(201).json({
      status: "success",
      message: "Restaurant created successfully",
      restaurant
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
};


const getRestaurants = async (req, res) => {
  try {

    // find restaurant
    const restaurants = await Restaurant.find().populate('menus')

    if(!restaurants){
      return res.status(404).json({
        status: 'fail',
        message: 'Not found'
      }) 
    }

    res.status(200).json({
      status: 'success',
      message: 'Restaurants fetched successfully',
      count: restaurants.length,
      data: restaurants
    })

    
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    })
  }
}


const getRestaurantById = async (req, res) => {
  try {

     const { id } = req.params

     if(!id){
      return res.status(400).json({
        status: 'fail',
        message: 'id is required'
      })
     }


     const restaurant = await Restaurant.findById(id).populate('menus')

     if(!restaurant){
      return res.status(404).json({
        status: 'fail',
        message: 'Restaurant not found'
      })
     }


     res.status(200).json({
      status: 'success',
      message: 'Restaurant fetched successfully',
      data: restaurant
     })
    
  } catch (error) {
       return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
       })
  }
}



const updateRestaurant = async (req, res) => {

     
   
     const { id } = req.params
    
     const { restaurantName, location, contact, menus, image } = req.body;

     //confirm the user is log in and its an owner
     const ownerId = req.user.id
       if(!ownerId){
        return res.status(403).json({
          status: 'fail',
          message: 'Unathorized access'
        })
     }
       

     

     try {

      // find restaurant by id
      const restaurant = await Restaurant.findById(id)

      // return error if the restaurant is not available
      if(!restaurant){
        return res.status(404).json({
          status:'fail',
          message: 'Restaurant not found'
        })
      }


      // check if the user id is thesame as the restaurant owner
      if(restaurant.ownerId.toString() !== ownerId){
        return res.status(403).json({
          status: 'fail',
          message: 'Access Denied, Only restaurant owner can update it'})
      }


      // Allow only provided field to update
     if(restaurantName) restaurant.restaurantName = restaurantName
     if(location) restaurant.location = location
     if(contact) restaurant.contact = contact
     if(image) restaurant.image = image
     if(menus) restaurant.menus = menus

     // save the changes
     await restaurant.save()

     // response
res.status(200).json({ 
  status: 'success',
  message: 'Restaurant updated successfully',
  date: restaurant
})

      
     } catch (error) {
       return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error.message
       })
     }
}


const deleteRestaurant = async (req, res) => {
  const { id } = req.params
  

  try {
    

    // find restaurant
    const restaurant = await Restaurant.findById(id)

    if(!restaurant){
      return res.status(404).json({
        status: 'fail',
        message: 'Restaurant not found'
      })
    }


    // Authorize only admin or owner
    if(req.user.role !== 'admin' && req.user.id !== restaurant.ownerId.toString()){
      return res.status(403).json({
        status: 'fail',
        message: 'Access Denied, can`t delete Restaurant'
      })
    }

    // delete restaurant
    const deleteRestaurant = await Restaurant.findByIdAndDelete(id)

    res.status(200).json({
      status: 'success',
      message:'Restaurant Deleted successfully'
    })

    
  } catch (error) {
    return res.status(500).jsom({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    })
  }
}

const restaurantController = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
};

export default restaurantController;
