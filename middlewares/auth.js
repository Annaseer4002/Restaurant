import Jwt from 'jsonwebtoken'

const Authorize = (req, res, next) => {
   const token = req.headers.authorization
    if (!token) {
        return res.status(401).json({
            status: 'fail',
            message: 'No token provided'
        })
    }

    
    
    // extract the token from Bearer <token>
    const splitToken = token.split(' ')

    // get the real token from the split token
    const realToken = splitToken[1]
   
    
// verify the token
    const decoded = Jwt.verify(realToken, process.env.ACCESS_TOKEN)
    

    // if token is not valid
    if(!decoded){
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token'
        })
    }
    
    // attach the decoded token to the request object
    req.user = decoded

   
    

    next()
}

export default Authorize