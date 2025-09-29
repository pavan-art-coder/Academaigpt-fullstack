const express=require('express')
const authrouter=express.Router()
const {register,login,googleSignIn}=require('../controllers/Authcrontroller')

authrouter.post('/register',register)
authrouter.post('/login',login)
authrouter.post('/google-signin',googleSignIn)
authrouter.get('/',(req,res)=>{
    res.send('Welcome to Auth Routes')
})

module.exports=authrouter