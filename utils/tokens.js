import jwt from "jsonwebtoken"


export const generateAccessToken = (user)=>{
      return jwt.sign({
        id: user?._id, email: user.email, role: user?.role
      },
      process.env.ACCESS_TOKEN,
      {expiresIn: '1h'}
    )
}


export const generateRefreshToken = (user)=>{
      return jwt.sign({
        id: user?._id,
      },
      process.env.ACCESS_TOKEN,
      {expiresIn: '1h'}
    )
}