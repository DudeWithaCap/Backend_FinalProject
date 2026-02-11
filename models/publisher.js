const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String },
    genre: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Publisher', publisherSchema);