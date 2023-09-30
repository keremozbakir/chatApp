// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { filterMessages } = require('./helpers/helperFunctions'); 
const app = express();
app.use(express.static('public'));

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
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/views/admin.html');
});

app.get('/download', (req, res) => { // Download the messages
    // Read the JSON file
    const jsonData = require(filePath);

    // Set response headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=messages.json');
    res.setHeader('Content-Type', 'application/json');

    // Send the JSON data as a response
    res.send(jsonData);
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
});

// Start the server and listen on port 3000
server.listen(3000, () => {
    console.log('Server listening on *:3000');
});



// Watch for changes in the messages.json file
let isProcessing = false;
fs.watch(filePath, (eventType, filename) => {
    if (!isProcessing && filename) {
        isProcessing = true; //Prevent trigger multiple times for single change 
        fs.readFile(filePath, (err, data) => {
            if (err) {
                throw err;
            }
            const jsonData = JSON.parse(data);
            const lastMessage = jsonData[jsonData.length - 1];
            io.emit('updateMessages', lastMessage);
            isProcessing = false;
        });
        console.log(`File ${filename} changed: ${eventType}`);
    }  
});

 
function addNewMessage(newObject) {
    
    console.log("ADDING TO MESSAGES JSON")
    // Read the existing JSON data from the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return;
        }

        newObject.id = generateRandomInteger()
        // Parse the JSON data into an array of objects
        let messages = JSON.parse(data);

        // Append the new object to the array
        messages.push(newObject);

        // Convert the updated array back to JSON format
        let updatedData = JSON.stringify(messages, null, 4);

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