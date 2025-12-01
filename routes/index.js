import express from "express";
import authRoutes from "./auth.js";
import restaurantRoutes from "./restaurant.js"
import menuRoutes from "./menu.js"
import orderRoutes from "./order.js"


const router = express.Router()


// Group routes according to categories
router.use("/auth", authRoutes)
router.use("/restaurant", restaurantRoutes )
router.use("/menu", menuRoutes)
router.use("/order", orderRoutes)


export default router;