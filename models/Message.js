const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  sender: { 
    type: String,
    required: true,
    enum: ['user', 'ai'],
  },
  text: { 
    type: String,
    required: true,
  },
  type: { 
    type: String,
    enum: ['Summary', 'Quiz'],
    optional: true,
  },
  content: {
    type: String,
    optional: true,
  },
}, { timestamps: true })

module.exports = messageSchema;