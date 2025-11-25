
import User from "../models/auth.js";
import sendMail from "../utils/sendMails.js";
import bcrypt from "bcryptjs"
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.js";


const register = async (req, res) => {
    try {
        

        const { fullname, email, password, role } = req.body;

        // Basic validation
        if (!fullname || !email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "fullname, email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email});
        if(existingUser){
            return res.status(400).json({
                status: "fail",
                message: "User with this email already exists"
            });
        }


        //hash password
       const hashedPassword = await bcrypt.hash(password, 10)


        // Create new user
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            role
        })


        
        // Save user to database
        await newUser.save();

        

        // Respond with success
        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: {
                id: newUser._id,
                fullname: newUser?.fullname,
                email: newUser?.email,
                role: newUser?.role
            }
        })


    
        
        // Prepare welcome email content
        const message = `Welcome to our Restaurant Management System, ${fullname.toUpperCase()}!
        Your account has been successfully created.
        you can now log in using your email: ${email}.
        Thank you for joining us!`;

        // send Welcome email
        await sendMail({
            to: email,
            subject: 'Welcome to Restaurant Management System',
            text: message});


    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Email and password are required"
            });
        }


        // Check if user exists
        const user = await User.findOne({ email })
        if(!user){
            return res.status(400).json({
                status: "fail",
                message: "Invalid email or password"
            });
        }

        
        // check if password is correct
        const isMatch = await bcrypt.compare(password, user?.password)
        if(!isMatch){
            return res.status(400).json({
                status: 'fail',
                message: 'Incorrect email or password'
            })
        }

        
        // Generate tokens (imported from utils/token.js)
        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

       

        res.status(200).json({
            status: 'success',
            message: 'User login successful',
            accessToken,
            refreshToken,
            data: {
                id: user?._id,
                email: user?.email,
                fullname: user?.fullname,
                role: user?.role
            }
        })




    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
}


const forgotPassword = async (req, res) => {
    try {

        const { email } = req.body

        if(!email){
            return res.status(400).json({
                status: 'fail',
                message: 'Email is required'
            })
        }

        const user = await User.findOne({ email })

        if(!user){
            res.status(404).json({
                status: 'fail',
                message: 'User account not found, please register'
            })
        }

        await sendMail({
            to: email,
            subject: 'Reset Password Notification',
            text: `Dear ${user.fullname.toUpperCase()}, \nYou have requested to reset your password.if that is you click the button below. \nReset password`,
            html: `Dear ${user.fullname.toUpperCase()} \n<p>You have requested to reset your password, if that is you click the button below.</p> \n<button>Reset password</button>`
        })

        res.status(200).json({
            status: 'success',
            message: 'Check your email or spam folder to reset your password'
        })
        
    } catch (error) {
        res.status(500).json({
            success: 'error',
            message: 'internal server error',
            error: error.message
        })
    }
}


const resetPassword = async (req, res) => {

    try {

        
    const { password } = req.body

    const email = req.user.email

    if(!password)
    return res.status(400).json({
         status: 'fail',
         message: 'password is required' 
    })

    const user = await User.findOne({email})

    if(!user){
       return res.status(404).json({
            status: 'fail',
            message: 'User account does not exist'
        })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)

    user.password = hashedPassword

    await user.save()

    res.status(200).json({
        status: 'success',
        message: 'Password reset successful'
    })
        
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        })
    }
}



const users = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        res.status(200).json({
            status: "success",
            message: "Users retrieved successfully",
            data: users
        })

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });
    }
}

const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: "fail",
                message: "User ID is required"
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            status: "success",
            message: "User deleted successfully"
        });
        
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        })
    }
}

// Export controller methods
const userController = {
    register,
    login,
    forgotPassword,
    resetPassword,
    users,
    deleteUser
}

export default userController;