import express from "express";
import restaurantController from "../controllers/restaurant.js";
import Authorize from "../middlewares/auth.js";

const router = express.Router();

router.post("/createRestaurant", Authorize, restaurantController.createRestaurant);
router.get("/getRestaurants", restaurantController.getRestaurants )
router.get("/getOneRestaurant/:id", restaurantController.getRestaurantById)
router.patch("/updateRestaurant/:id", Authorize, restaurantController.updateRestaurant)
router.delete("/deleteRestaurant/:id", Authorize, restaurantController.deleteRestaurant)

export default router;
