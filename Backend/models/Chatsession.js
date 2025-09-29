const mongoose = require('mongoose');
const messageSchema = require('./Message')

const chatSessionSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true,
  },
  document: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Document',
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);