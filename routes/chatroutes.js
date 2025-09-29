const express = require('express');
const chatrouter = express.Router();
const { handleChatMessage, generateQuiz } = require('../controllers/Chatcontroller');
const authmiddleware = require('../middleware/authmiddleware');

chatrouter.post('/message', authmiddleware, handleChatMessage);
module.exports = chatrouter;