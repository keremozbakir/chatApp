// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { filterMessages } = require('./helpers/helperFunctions'); 
const { authenticate} = require('./middlewares/auth')
const jwt = require('jsonwebtoken');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const secretkey = 'benimadimkerem'
const cors = require('cors'); 

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json()); // Enable JSON request body parsing middleware
app.use(cors());
require('dotenv').config(); 
// Create an HTTP server by passing the Express app
const server = http.createServer(app);
const filePath = './public/messages.json';
// Create a Socket.io instance by passing the server
const io = socketIo(server);

// Serve the client-side HTML file on the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});


// Serve the client-side HTML file on the root URL
app.get('/admin', authenticate,(req, res) => {
    res.sendFile(__dirname + '/views/admin.html');
});

// Render login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});


app.post('/login', (req, res) => {
    const {email,password} =req.body;
  
    const hardcodedEmail =process.env.ADMIN_EMAIL;
    const hardcodedPassword =process.env.ADMIN_PASSWORD;

    // Check if the provided email and password match the hardcoded values
    if (email === hardcodedEmail && password === hardcodedPassword) {
        // Valid credentials, create a JWT token
        const user = {
            email: hardcodedEmail
        };
        const token = jwt.sign(user, secretkey, { expiresIn: '1h' });

        // Set the JWT token as a cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000 }); // Max Age is in milliseconds (1 hour in this example)
         
        res.redirect('/admin')
    } else {
        // Invalid credentials
        res.status(401).json({ message: 'Invalid email or password' });
    }
});


app.get('/download', authenticate, (req, res) => {
    try {
        // Read the JSON file
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




// Create a set to store emitted users
const emittedUsers = new Set();

// Handle Socket.io connections
io.on('connection', (socket) => {
   // console.log('A user connected');
    if (!emittedUsers.has(socket.id)) {
        // Emit the message to the user
        console.log('A new user connected with id : ',socket.id);
        const oldMessages = allMessages();
        io.emit('loadMessages',oldMessages) 
        emittedUsers.add(socket.id);
        console.log('all users: ',emittedUsers)
        
    }
    
    
     
    // Handle messages from clients
    socket.on('chat message', (msg) => {
        console.log('Message: ' + msg);

        // Broadcast the message to all connected clients
        io.emit('chat message', msg);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    //Add message to message.json
    socket.on('message incoming',incomingMessage =>{
        addNewMessage(incomingMessage)
    })

    //new message change
    socket.on('jsonFileChanged',updtedMessages=>{
        console.log("updated messages")
        console.log(updtedMessages)
    })

    socket.on('delete push from dom',incomingIDS=>{
        io.emit('delete push from dom',incomingIDS)
        deleteMessagesByIds(incomingIDS)

    })
});

// Start the server and listen on port 3000
server.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on :'+process.env.PORT);
});



// // Watch for changes in the messages.json file
// let isProcessing = false;
 
// fs.watch(filePath, (eventType, filename) => {
//     if (!isProcessing && filename ) {
//         isProcessing = true; //Prevent trigger multiple times for single change 
//         fs.readFile(filePath, (err, data) => {
//             if (err) {
//                 throw err;
//             }
//             const jsonData = JSON.parse(data);
//             const lastMessage = jsonData[jsonData.length - 1];
             
//             io.emit('updateMessages', lastMessage);
//             isProcessing = false;
           
         
//         });
//         console.log(`File ${filename} changed: ${eventType}`);
//         console.log('-----------------------------------------------------')
//     }  
// });

// Watch for changes in the messages.json file
let isProcessing = false;

fs.watch(filePath, (eventType, filename) => {
    if (!isProcessing && filename) {
        isProcessing = true; // Prevent trigger multiple times for single change 
        fs.stat(filePath, (err, stats) => {
            if (err) {
                throw err;
            }

            // Compare the current file size with the previous size
            if (stats.size > previousFileSize) {
                // Read the new data and emit events
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        throw err;
                    }
                    const jsonData = JSON.parse(data);
                    const lastMessage = jsonData[jsonData.length - 1];
                    io.emit('updateMessages', lastMessage);
                    isProcessing = false;
                });
                previousFileSize = stats.size; // Update the previous file size
            } else {
                isProcessing = false; // Reset the flag for deletion events
            }
        });
        console.log(`File ${filename} changed: ${eventType}`);
         
    }
});

// Initialize previous file size
let previousFileSize = fs.statSync(filePath).size;




 
function addNewMessage(newObject) {
    
     
    // Read the existing JSON data from the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }
        newObject.id = generateRandomInteger()
        let messages = JSON.parse(data); // Parse the JSON data into an array of objects
        messages.push(newObject);
        let updatedData = JSON.stringify(messages, null, 4); // Convert the updated array back to JSON format

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, updatedData, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log('Object appended successfully.');
            }
        });
    });
}

function generateRandomInteger() {
    const min = 1000000; // Minimum 7-digit number
    const max = 9999999; // Maximum 7-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function allMessages() {
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const messages = JSON.parse(jsonData);
        return filterMessages(messages,-10)
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}


function deleteMessagesByIds(idsToDelete) {
    // Read the existing JSON data from the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }
        let messages = JSON.parse(data); // Parse the JSON data into an array of objects

        // Iterate through the array of IDs to delete
        idsToDelete.forEach(idToDelete => {
            // Find the index of the object with the specified id
            const indexToDelete = messages.findIndex(message => message.id === idToDelete);

            if (indexToDelete !== -1) {
                // Remove the object from the array
                messages.splice(indexToDelete, 1);
                console.log(`Object with id ${idToDelete} deleted successfully.`);
            } else {
                console.log(`Object with id ${idToDelete} not found.`);
            }
        });

        // Convert the updated array back to JSON format
        let updatedData = JSON.stringify(messages, null, 4);

        // Write the updated JSON data back to the file
        fs.writeFile(filePath, updatedData, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
            } else {
                console.log(`All specified objects deleted successfully.`);
            }
        });
    });
}






