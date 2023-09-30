const socket = io('http://localhost:3000');
var messagesUpdated = false;

socket.on('chat-message', (message) => {
    console.log(message); // Output: hello world
});

socket.on('loadMessages',allMessages=>{
    console.log('loadMessages socket running! ')
    console.log('already updated : ',messagesUpdated)
    if(!messagesUpdated){
      allMessages.forEach(element => {
        if(element.isAdmin){ 
          addMessageToListClient(element.message) // only view admin messages which are push messages
        }
       });
       messagesUpdated=true
    }
    
})

socket.on('updateMessages',updatedMessage=>{
    console.log("updateMessages socket running on client side" )
    console.log(updatedMessage)
    addMessageToListClient(updatedMessage.message)
    
  })


// Function to add new message to the messages list
function addMessageToListClient(message) {
    console.log('addMessage function running!')
    const messagesList = document.getElementById('pushMessages');
    const listItem = document.createElement('li');
    listItem.textContent = message;
    messagesList.appendChild(listItem); // Append the new li element to messagesList
  }