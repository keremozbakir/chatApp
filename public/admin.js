const socket = io('http://localhost:3000');
var messagesUpdated = false;

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
  console.log("updateMessages socket running " )
  console.log(updatedMessage)
  addMessageToList(updatedMessage.message)
  
})

socket.on('loadMessages',allMessages=>{
  console.log('loadMessages socket running! ')
  console.log('already updated : ',messagesUpdated)
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
  console.log('addMessage function running!')
  const messagesList = document.getElementById('messagesList');
  const listItem = document.createElement('li');
  listItem.textContent = message;
  messagesList.appendChild(listItem); // Append the new li element to messagesList
}