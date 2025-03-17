// backend/models/submission.model.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    aiResponse: { type: String } // Optional field for AI response
    // Timestamp is automatically added by Mongoose
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;