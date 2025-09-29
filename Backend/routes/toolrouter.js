const express=require('express')
const toolrouter=express.Router()
const {generateQuiz,generateSummary,createNewChat}=require('../controllers/Chatcontroller')
const authmiddleware=require('../middleware/authmiddleware')

toolrouter.post('/quiz',authmiddleware,generateQuiz)
toolrouter.post('/summary',authmiddleware,generateSummary)
toolrouter.post('/newchat',authmiddleware,createNewChat)
toolrouter.get('/',(req,res)=>{
    res.send('Welcome to Tool Routes')
})
module.exports=toolrouter