const socket = io('http://localhost:3000');


function sendPushMsg() {
    // Get the message from the input field
  var pushMessage = document.getElementById('pushInput').value
  var message ={
    message:pushMessage,
    isAdmin:true
  }
  
  socket.emit('push message incoming',message)
  pushMessage=''
}



socket.on('updateMessages',updatedMessage=>{
  console.log("adminjs running after message updated " )
  console.log(updatedMessage)
  addMessageToList(updatedMessage.message)
  
})

socket.on('loadMessages',allMessages=>{
 allMessages.forEach(element => {
  if(element.isAdmin){ 
    addMessageToList(element.message) // only view admin messages which are push messages
  }
  
 });
})

// Function to add new message to the messages list
function addMessageToList(message) {
  const messagesList = document.getElementById('messagesList');
  const listItem = document.createElement('li');
  listItem.textContent = message;
  messagesList.appendChild(listItem); // Append the new li element to messagesList
}