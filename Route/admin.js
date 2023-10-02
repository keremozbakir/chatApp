const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
const path = require('path');
const parentDirectoryPath = path.resolve(__dirname, '..'); // Set the directory 
// Serve the client-side HTML file on the root URL
router.get('/', (req, res) => {
    res.sendFile( parentDirectoryPath + '/views/admin.html');
});

// Render login page
router.get('/login', (req, res) => {
    res.sendFile(parentDirectoryPath + '/views/login.html');
});


router.post('/login', (req, res) => {
    const {email,password} =req.body;
  
    const hardcodedEmail =process.env.ADMIN_EMAIL;
    const hardcodedPassword =process.env.ADMIN_PASSWORD;

    // Check if the provided email and password match the hardcoded values
    if (email === hardcodedEmail && password === hardcodedPassword) {
        // Valid credentials, create a JWT token
        const user = {
            email: hardcodedEmail
        };
        const token = jwt.sign(user, process.env.API_KEY, { expiresIn: '1h' });
        // Set the JWT token as a cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // Max Age is in milliseconds (1 hour in this example)
        res.redirect('/admin')
    } else {
        // Invalid credentials
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

module.exports = router;
