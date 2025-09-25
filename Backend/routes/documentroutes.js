const express = require('express');
const documentrouter = express.Router();
const upload = require('../middleware/multer');
const { uploadDocument} = require('../controllers/Documentontroller');
const authmiddleware = require('../middleware/authmiddleware'); 

documentrouter.post('/upload', authmiddleware, upload.single('document'), uploadDocument);

documentrouter.get('/', (req, res) => {
    res.send('Welcome to Document Routes');
}
);
module.exports = documentrouter;