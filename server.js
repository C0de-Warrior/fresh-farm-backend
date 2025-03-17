// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // Ensure axios is installed
const WebSocket = require('ws'); // Import WebSocket library
const { analyzeSentiment } = require('./ai'); // Import the analyzeSentiment function
const Submission = require('./models/submission.js'); // Corrected path to .model.js

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MONGO_URI environment variable is not defined. Please check your .env file.");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB database connected'))
    .catch(err => console.log('MongoDB connection error:', err));



// **--- WebSocket Server Setup ---**
const wss = new WebSocket.Server({ port: 8080 }); // WebSocket server on port 8080

wss.on('connection', ws => {
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });
});

function broadcastNewSubmission() { // Function to send message to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send('new_submission'); // Simple message indicating a new submission
        }
    });
}
// **--- End WebSocket Server Setup ---**


// POST endpoint to accept form submissions
app.post('/submissions', async (req, res) => {
    console.log('Received submission:', req.body);
    try {
        const formData = req.body;
        const { name, email, message } = formData;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required.' });
        }

        const newSubmission = new Submission({
            name,
            email,
            message
        });

        console.log("Before analyzeSentiment call, message:", message);
        const sentiment = await analyzeSentiment(message); // Call the function from ai.js
        console.log("After analyzeSentiment call, sentiment:", sentiment);
        newSubmission.aiResponse = sentiment;

        const savedSubmission = await newSubmission.save();
        console.log('Saved submission with AI response:', savedSubmission);

        broadcastNewSubmission();
        res.json(savedSubmission);

    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ error: error.message || 'Failed to save DB submission' });
    }
});

// GET endpoint to retrieve all submissions
app.get('/submissions', async (req, res) => {
    try {
        const submissions = await Submission.find();
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
});

// Start the Express server
app.listen(port, () => console.log(`Server running on port ${port}`));