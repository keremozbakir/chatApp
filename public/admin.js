const socket = io('http://localhost:3000');
var messagesUpdated = false; // Only load old messages once for every user 


function sendPushMsg() {
  var messageInput = document.getElementById('pushInput');
  var messageText = messageInput.value.trim();  
  if (messageText !== "") {  
      var message = {
          message: messageText,
          isAdmin: true
      };
      socket.emit('message incoming', message);   
      messageInput.value = '';  
  } else {
      console.log('Empty message, not sending.');  
  }
}

socket.on('updateMessages',updatedMessage=>{
  console.log("Update message running on admin.js")
  if(updatedMessage.isAdmin){
    addMessageToList(updatedMessage.message)
  }
  
  
})

socket.on('loadMessages',allMessages=>{
   
  if(!messagesUpdated){
    allMessages.forEach(element => {
      if(element.isAdmin){ 
        addMessageToList(element.message) // only view admin messages which are push messages
      }
     });
     messagesUpdated=true
  }
  
})

// Function to add new message to the messages list
function addMessageToList(message) {
  //if(message.isAdmin === false){return}
  console.log("mesaj bu : ")
  console.log(message)
  const messagesList = document.getElementById('messagesList');
  const listItem = document.createElement('li');
  listItem.textContent = message;
  messagesList.appendChild(listItem); // Append the new li element to messagesList
}

function downloadMessages(){
  window.location.href = '/download';
}