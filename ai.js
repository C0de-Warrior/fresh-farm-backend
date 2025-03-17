// backend/ai.js
const axios = require('axios');

async function analyzeSentiment(feedbackMessage) {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
        const promptText = `Analyze the sentiment of the following customer message and classify it as positive, negative, or neutral. Just return the sentiment label (positive, negative, or neutral).\n\nCustomer Message: "${feedbackMessage}"`;
        const requestData = { contents: [{ parts: [{ text: promptText }] }] };

        const aiResponse = await axios.post(apiUrl, requestData);
        const aiResponseText = aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text || "No sentiment analysis result.";
        console.log("AI Sentiment Analysis Result:", aiResponseText);
        return aiResponseText;

    } catch (aiError) {
        console.error("Error calling Gemini API:", aiError);
        return `AI Analysis Error: ${aiError.message}`;
    }
}

module.exports = { analyzeSentiment };