const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const { addNewMessage,allMessages,deleteMessagesByIds} = require('./helpers/helperFunctions'); 
const { authenticate} = require('./middlewares/auth')
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors'); 
const server = http.createServer(app);
const filePath = './public/messages.json';
const io = socketIo(server);
const downloadRoutes = require('./Route/download')
const adminRoutes = require('./Route/admin')

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());  
app.use(cors());
require('dotenv').config(); 
 



//Routes
app.use('/download',authenticate, downloadRoutes);
app.use('/admin',authenticate,   adminRoutes);

// Serve the client-side HTML file on the root URL
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

// Create a set to store emitted users
const emittedUsers = new Set();

// Handle Socket.io connections
io.on('connection', (socket) => {
   // console.log('A user connected');
    if (!emittedUsers.has(socket.id)) {
        // Emit the message to the user
        console.log('A new user connected with id : ',socket.id);
        const oldMessages = allMessages(); // Load messages from database
        io.emit('loadMessages',oldMessages) 
        emittedUsers.add(socket.id);
        console.log('all users: ',emittedUsers)
        
    }
    
    // Handle messages from clients
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);   // Broadcast the message to all connected clients
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    //Add message to message.json
    socket.on('message incoming',incomingMessage =>{
        addNewMessage(incomingMessage)
    })

    socket.on('delete push from dom',incomingIDS=>{
        io.emit('delete push from dom',incomingIDS)
        deleteMessagesByIds(incomingIDS)

    })
});

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


// Start the server and listen on port 3000
server.listen(process.env.PORT || 3000, () => {
    console.log('Server listening on :'+process.env.PORT);
});

 