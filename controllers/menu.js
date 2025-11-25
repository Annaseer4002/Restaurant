import Menu from "../models/menu.js"
import Restaurant from "../models/restaurant.js"

const menu = async (req, res)=>{
    const { restaurantId, name, description, price, image, availability} = req.body

    if(!restaurantId || !name || !description || !price || !image || !availability){
        return res.status(400).json({
            status: 'fail',
            message: 'All fields are required'
        })
    }

    try {

        
    // find restaurant
    const restaurant = await Restaurant.findById(restaurantId)

    if(!restaurant){
        return res.status(404).json({
            status:'fail',
            message: 'Restaurant not found'
        })
    }
    
    // Allow only restaurant owner to add menu
    if(req.user.id !== restaurant.ownerId.toString()){
        return res.status(403).json({
            status:'fail',
            message:'Access Denied'
        })
    }


    const menu = new Menu({
        restaurantId,
        name,
        description,
        price,
        image,
        availability
    })


    await menu.save()

    await Restaurant.findByIdAndUpdate(restaurantId, {
        $push: { menus: menu._id }
    })

    res.status(201).json({
        status:'success',
        message: 'Menu addedd successfully',
        data: menu
    })
        
    } catch (error) {
        return res.status(500).json({
           status: 'error',
           message: 'Internal server error',
           error: error.message
        })
    }

}


const updateMenu = async (req, res) => {
    const { id } = req.params
    const { name, description, price, image, availability } = req.body

  

    try {

           // find the menu by id
    const menu = await Menu.findById(id)
    if(!menu){
       return res.status(404).json({
        status:'fail',
        message:'Menu not found'
       })
    }

      // find restaurant
    const restaurant = await Restaurant.findById(menu.restaurantId)
    if(!restaurant){
         return res.status(404).json({
        status:'fail',
        message:'Restaurant not found'
       })
    }

    // Authorize only restaurant owner to update menu
    if(restaurant.ownerId.toString() !== req.user.id){
        return res.status(403).json({
            status:'fail',
            message:'Access Denied'
        })
    }


    // update only passed fields
    if(name) menu.name = name
    if(description) menu.description = description
    if(price) menu.price = price
    if(image) menu.image = image
    if(availability) menu.availability = availability


    await menu.save()

    res.status(200).json({
        status: 'success',
        message: 'Menu updated successfully',
        data: menu
    })
        
    } catch (error) {
        return res.status(500).json({
            status:'error',
            message: 'Internal server error',
            error: error.message
        })
    }
    
}


const deleteMenu = async (req, res) => {
    const { id } = req.params


    try {
          // find menu
    const menu = await Menu.findById(id)
    if(!menu){
        return res.status(404).json({
            status: 'fail',
            message: 'Menu not found'
        })
    }


    // find restaurant
    const restaurant = await Restaurant.findById(menu.restaurantId)
    if(!restaurant){
        return res.status(404).json({
            status: 'fail',
            message:'Restaurant not found'
        })
    }

     // Authorize only admin or owner
    if(req.user.role !== 'admin' && req.user.id !== restaurant.ownerId.toString()){
      return res.status(403).json({
        status: 'fail',
        message: 'Access Denied, can`t delete Restaurant'
      })
    }


     // delete menu
    const deletedMenu = await Menu.findByIdAndDelete(id)

    res.status(200).json({
      status: 'success',
      message:'Menu Deleted successfully'
    })

        
    } catch (error) {
        return res.status(200).json({
            status:'error',
            message:'Internal server error',
            error: error.message
        })
    }
  
}

const restaurantMenus = async (req, res) => {
    const { id } = req.params;

    try {
        // find restaurant's menus
        const menus = await Menu.find({restaurantId: id});

        if (menus.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No menus found for this restaurant'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Restaurant menus fetched successfully',
            data: menus
        });
        
    } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
            error: error.message
        });
    }
};



const getMenuById  = async (req, res) => {
     const { id } = req.params

     try {

        // find menu by it`s id
        const menu = await Menu.findById(id)

        if(!menu){
            return res.status(404).json({
                status: 'fail',
                message: 'Menu not found'
            })
        }

        res.status(200).json({
            status:'success',
            message: 'Menu item fetched successfully',
            data: menu
        })

    
     } catch (error) {
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
            error: error.message
        })
     }
}


const findAllMenus = async (req, res) => {

   try {

    // all menus
    const menus = await Menu.find()

    if(!menus){
        return res.status(404).json({
           status: 'fail',
            message: 'Menus not found'
        })   
    }

    res.status(200).json({
        status:'success',
        message:'Menus fetched successfully',
        data: menus
    })

    
   } catch (error) {
     return res.status(500).json({
        status:'error',
        message: 'Internal server error',
        error: error.message
     })
   }
    
}




const menuController = {
    menu,
    updateMenu,
    deleteMenu,
    restaurantMenus,
    getMenuById,
    findAllMenus
}


export default menuController 