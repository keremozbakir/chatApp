const express = require('express');
const router = express.Router();
 const filePath = '../public/messages.json';


router.get('/', (req, res) => {
    try {
        const jsonData = require(filePath);
        const messages = [];
        const pushMessages = [];

        // Separate messages based on the isAdmin property
        jsonData.forEach(element => {
            if (element.isAdmin) {
                pushMessages.push(element);
            } else {
                messages.push(element);
            }
        });

        // Set response headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=messages.json');
        res.setHeader('Content-Type', 'application/json');

      

        // Create an object containing both types of messages
        const result = {
            pushMessages: pushMessages,
            messages: messages
        };

        // Send the JSON data as a response
        res.json(result);
        
    } catch (error) {
        // Handle errors when reading the JSON file
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
