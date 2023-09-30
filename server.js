// Import required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
// Create an Express application
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


// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');
    const oldMessages = allMessages();
    if(oldMessages){
        console.log('hereee')
        io.emit('loadMessages',oldMessages) 
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

    //Handle incoming push messages
    socket.on('push message incoming',incomingMessage =>{
        console.log("new message: ")
        console.log(incomingMessage)
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
        isProcessing = true;
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
        //console.log(jsonData)
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return null;
    }
}