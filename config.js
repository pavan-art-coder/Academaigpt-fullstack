const dotenv = require('dotenv');
const path = require('path');

// This finds the .env file in your main backend folder
dotenv.config({ path: path.resolve(__dirname, '.env') });

// This object will hold all our validated keys
const config = {
    PORT: process.env.PORT,
    googleApiKey: process.env.GOOGLE_API_KEY,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    firebaseServiceAccountKey: process.env.GOOGLE_APPLICATION_CREDENTIALS
};

// Check if any essential keys are missing
if (!config.googleApiKey || !config.mongoUri || !config.jwtSecret || !config.firebaseServiceAccountKey || !config.PORT) {
    console.error("❌ FATAL ERROR: Missing one or more required environment variables in .env file.");
    process.exit(1); // Stop the server if any key is missing
}

module.exports = config;