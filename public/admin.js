const socket = io('http://localhost:3000');
var messagesUpdated = false; // Only load old messages once for every user 
const checkedMessageIds =[]



 
socket.on('loadMessages',allMessages=>{ // loads the old messages on first load
  if(!messagesUpdated){
    allMessages.forEach(element => {
      if(element.isAdmin){ 
        addMessageToList(element) // only view admin messages which are push messages
      }
     });
     messagesUpdated=true
  }
})

socket.on('updateMessages',updatedMessage=>{ // If new message is sent , updates the DOM
 if(updatedMessage.isAdmin){
    addMessageToList(updatedMessage)
  }
})

function addMessageToList(messageObject) {  //Update the DOM by creating HTML elements for each message
  // Check if message.isAdmin is false, and if so, don't add the message to the list
  if (messageObject.isAdmin === false) {
      return false;
  }
 
  const messagesList = document.getElementById('messagesList');
  const listItem = document.createElement('div');
  listItem.textContent = messageObject.message;
  listItem.className = 'single-message';
  listItem.setAttribute('data-message-id', messageObject.id);
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'messageCheckbox';

 
  checkbox.setAttribute('data-message-id', messageObject.id);
  checkbox.style.float = 'right';

  // Add event listener to handle checkbox changes
  checkbox.addEventListener('change', function() {
      // Get the message ID from the data attribute of the checkbox
      const messageId = parseInt(this.getAttribute('data-message-id'));

      if (this.checked) {
          checkedMessageIds.push(messageId); // Add checked message ID to the array if it is checked
      } else {
          const index = checkedMessageIds.indexOf(messageId); // Remove unchecked message ID from the array if it is unchecked
          if (index !== -1) {
              checkedMessageIds.splice(index, 1);
          }
         
      }

      console.log('Checked users are: ', checkedMessageIds);
  });

  listItem.appendChild(checkbox);
  messagesList.appendChild(listItem);
}

function downloadMessages(){
  window.location.href = '/download';
}


function deletePushMessageView() {  //  remove element from the DOM
  var elementsToDelete = {};
  // Find elements with specified message IDs and store them in the elementsToDelete object
  checkedMessageIds.forEach(function(messageId) {
      var element = document.querySelector('[data-message-id="' + messageId + '"]');
      if (element) {
          elementsToDelete[messageId] = element;
      }
  });
  // Remove elements from the DOM
  Object.keys(elementsToDelete).forEach(function(messageId) {
      var element = elementsToDelete[messageId];
      var parentElement = element.parentNode;
      parentElement.removeChild(element);
  });
   
  socket.emit('delete push from dom',checkedMessageIds) // passing list of message ids of push messages to be deleted from DOM
}


function sendPushMsg() { // Send push notification
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