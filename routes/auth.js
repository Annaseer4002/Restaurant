import express from "express";
import userController from "../controllers/auth.js";
import Authorize from "../middlewares/auth.js";
const router = express.Router()

router.post('/register', userController.register )
router.post('/login', userController.login )
router.post('/forgotPassword', userController.forgotPassword)
router.patch('/resetPassword', userController.resetPassword)
router.get('/users', Authorize, userController.users)
router.delete('/deleteUser/:id', Authorize, userController.deleteUser)



export default router;