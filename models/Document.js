const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true,
    },
    storagePath:{
        type: String,
        required: true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Document', documentSchema);
