const jwt=require('jsonwebtoken')
const User=require('../models/User')
require('dotenv').config()
const JWT_SECRET=process.env.JWT_SECRET

const authmiddleware=async(req,res,next)=>{
    const token=req.headers.authorization?.split(' ')[1]
    if(!token){
        return res.status(401).json({message:'No token,authorization denied'})
    }
    try{
        const decoded=jwt.verify(token,JWT_SECRET)
        req.user=await User.findById(decoded.id).select('-password')
        next()
    }catch(error){
        console.error('Error in auth middleware:',error)
        res.status(401).json({message:'Token is not valid'})
    }
}
module.exports=authmiddleware