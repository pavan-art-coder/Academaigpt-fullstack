require('dotenv').config()
console.log("Is the API Key loaded?", process.env.GOOGLE_API_KEY);


const express=require('express')
const cors=require('cors')
const bodyParser=require('body-parser')
const userRoutes=require('./routes/authroutes')
const documentRoutes=require('./routes/documentroutes') 
const chatRoutes=require('./routes/chatroutes')
const toolrouter=require('./routes/toolrouter')



const app=express()
const PORT=process.env.PORT || 5000
const connectDB=require('./config.js/db')
const admin = require("firebase-admin");


const MONGO_URI=process.env.MONGO_URI

app.use(express.json())
app.use(bodyParser.json())
app.use('/api/auth',userRoutes)
app.use('/api/documents',documentRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/tools',toolrouter)


const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/',(req,res)=>{
    res.send('Welcome to AcademiaGPT Backend Server')
})


app.listen(PORT,async()=>{
    try{ 
        await connectDB(MONGO_URI)
        console.log(`Server is running on port ${PORT}`)
        
    }catch(error){
        console.log('Error connecting to Server:',error)
    }
});