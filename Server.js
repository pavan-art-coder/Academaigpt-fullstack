// 1. Import and run our central config file FIRST.
const config = require('./config');

console.log("Is the API Key loaded?", config.googleApiKey ? "Yes" : "No");

// 2. Import all other necessary packages
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const connectDB = require('./database.js/db'); // Correct path assuming db.js is in config/

// Import your route files
const authRoutes = require('./routes/authroutes');
const documentRoutes = require('./routes/documentroutes');
const chatRoutes = require('./routes/chatroutes');

// --- Initialize Express App ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- THIS IS THE FIX ---
// Use JSON.parse() to read the key string from your config
const serviceAccount = JSON.parse(config.firebaseServiceAccountKey);

// Initialize Firebase Admin with the parsed key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
// --------------------

// --- Middlewares ---
app.use(cors({ origin: 'http://localhost:5173' })); 
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', chatRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to AcademiaGPT Backend Server');
});

// --- Start Server ---
const startServer = async () => {
    try {
        await connectDB(config.mongoUri);
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();