import express from 'express';
import menuController from '../controllers/menu.js';
import Authorize from '../middlewares/auth.js';

const router = express.Router();

// Define menu routes here
router.post('/createMenu', Authorize, menuController.menu)
router.get('/getMenus', menuController.findAllMenus)
router.get('/getMenu/:id', menuController.getMenuById)
router.get('/getMenusByRestaurant/:id', menuController.restaurantMenus)
router.patch('/updateMenu/:id', Authorize, menuController.updateMenu)
router.delete('/deleteMenu/:id', Authorize, menuController.deleteMenu)


export default router;