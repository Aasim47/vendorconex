// File: codeZone/vendorconex/backend/routes/chat.js

const express = require('express');
const router = express.Router();
require('dotenv').config(); // <--- This line is essential to load environment variables from .env

// @route   POST /api/chat
// @desc    Send a message to the chatbot and get a response from Gemini LLM
// @access  Public (or Private if you want to require authentication for chat)
router.post('/', async (req, res) => {
    const { message, chatHistory = [] } = req.body; // 'chatHistory' can be passed for context

    // Basic validation for the incoming message
    if (!message) {
        return res.status(400).json({ message: 'Message is required for chatbot interaction.' });
    }

    try {
        // Prepare chat history for the Gemini API payload
        // The Gemini API expects 'contents' as an array of objects with 'role' and 'parts'
        let conversation = [...chatHistory]; // Start with any existing conversation history
        conversation.push({ role: "user", parts: [{ text: message }] }); // Add the current user's message

        // Retrieve the Gemini API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY;
        // Check if the API key is available
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in environment variables.");
            return res.status(500).json({ message: "Server error: Gemini API key is missing." });
        }

        // Construct the Gemini API URL
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Prepare the payload for the API request
        const payload = {
            contents: conversation // Send the full conversation history to maintain context
        };

        // Make the fetch call to the Gemini API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Parse the JSON response from the Gemini API
        const result = await response.json();

        // Check for non-200 HTTP status codes from the Gemini API (e.g., 400, 403, 429)
        if (response.status !== 200) {
            console.error('Gemini API Error Response (HTTP Status ' + response.status + '):', JSON.stringify(result, null, 2));
            return res.status(response.status).json({
                message: result.error ? result.error.message : 'Error communicating with Gemini API.',
                details: result // Include full error details for debugging
            });
        }

        // Process the successful response from Gemini
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const botResponseText = result.candidates[0].content.parts[0].text;

            // Add the bot's response to the conversation history for subsequent turns
            conversation.push({ role: "model", parts: [{ text: botResponseText }] });

            // Send the bot's response and the updated chat history back to the client
            res.status(200).json({
                response: botResponseText,
                chatHistory: conversation // Return updated history for the frontend to manage
            });
        } else {
            // Handle cases where the Gemini API response structure is unexpected or empty
            console.error('Unexpected Gemini API response structure (no candidates found):', JSON.stringify(result, null, 2));
            res.status(500).json({ message: 'Could not get a valid response from the chatbot. Please try again.' });
        }

    } catch (error) {
        // Catch any network or unexpected errors during the fetch operation
        console.error('Error interacting with chatbot:', error);
        res.status(500).json({ message: 'Server error during chatbot interaction.' });
    }
});

module.exports = router;