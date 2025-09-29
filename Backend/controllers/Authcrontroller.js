const express=require('express')
const User=require('../models/User')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const admin = require('firebase-admin'); 
require('dotenv').config()

const JWT_SECRET=process.env.JWT_SECRET

const register=async(req,res)=>{
    const {name,email,password}=req.body
    if(!name || !email || !password){
        return res.status(400).json({message:'Please enter all fields'})
        }
    try{
        const user=await User.findOne({email})
        if(user){
            return res.status(400).json({message:'User already exists'})
        }
        const hashedPassword=await bcrypt.hash(password,10)

        const newuser=await User.create({
            name,
            email,
            password:hashedPassword
        })
        res.status(201).json({message:'User registered successfully',"ruser":newuser})
    }catch(error){
        console.error('Error during registration:',error)
        res.status(500).json({message:'Server error'})
    }   
}
const login=async(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({message:'Please enter all fields'})
    }
    try{
        const Luser=await User.findOne({email})
        if(!Luser){
            return res.status(400).json({message:'User does not exist'})
        }
        const Match=await bcrypt.compare(password,Luser.password)
        if(!Match){
            return res.status(400).json({message:'Invalid credentials'})
        }
        const token=jwt.sign({id:Luser._id},JWT_SECRET,{expiresIn:'1h'})
        res.status(200).json({message:'User Logined Successfully',token,"luser":Luser})
    }catch(error){
        console.error('Error during login:',error)
        res.status(500).json({message:'Server error'})
    }
}



// const googleSignIn = async (req, res) => {
//     const { token } = req.body;
//         if (!token) {
//             return res.status(400).json({ message: 'Token is required' });
//         }
//     try {
//         const decodedToken = await admin.auth().verifyIdToken(token);
//         const { email, name, uid } = decodedToken;
//         const user = await User.findOne({ email });
//         if (!user) {
//             user = await User.create({
//                 name: name,
//                 email: email,
//                 googleId: uid, 
//         });
//         }
//         const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         res.status(200).json({ 
//             message: 'Google Signin Successful', 
//             token: appToken, 
//             user 
//         });

//     } 
//     catch (error) {
//         console.error('Error during Google signin:', error);
//         res.status(401).json({ message: 'Invalid or expired token' });
//     }
// };

const googleSignIn = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        // Step 1: Verify the Google ID token using Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, uid } = decodedToken;

        // Step 2: Find user by email OR create them if they don't exist (more efficient)
        const user = await User.findOneAndUpdate(
            { email: email },
            { 
                $setOnInsert: { // This data is only set when a NEW user is created
                    name: name,
                    email: email,
                    googleId: uid,
                },
            },
            { 
                new: true, // Return the new document if created
                upsert: true, // Create the document if it does not exist
            }
        );

        // Step 3: Create your app's own JWT to manage the session
        const appToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d', // A longer expiration for convenience
        });

        // Step 4: Send the token and user info back to the frontend
        res.status(200).json({ 
            message: 'Google Sign-in Successful', 
            token: appToken, 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.error('Error during Google sign-in:', error);
        res.status(401).json({ message: 'Invalid or expired Google token' });
    }
};

;
module.exports={register,login,googleSignIn}
