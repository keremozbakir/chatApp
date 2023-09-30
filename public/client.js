const socket = io('http://localhost:3000');

socket.on('chat-message', (message) => {
    console.log(message); // Output: hello world
});

 