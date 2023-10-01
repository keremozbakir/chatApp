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
    addMessageToList(updatedMessage)
  }
  
  
})

socket.on('loadMessages',allMessages=>{
   
  if(!messagesUpdated){
    allMessages.forEach(element => {
      if(element.isAdmin){ 
        addMessageToList(element) // only view admin messages which are push messages
      }
     });
     messagesUpdated=true
  }
  
})

function addMessageToList(messageObject) {
  // Check if message.isAdmin is false, and if so, don't add the message to the list
  if (messageObject.isAdmin === false) {
      return;
  }

  // Get the messagesList element from the DOM
  const messagesList = document.getElementById('messagesList');

  // Create a new list item for the message
  const listItem = document.createElement('div');
  listItem.textContent = messageObject.message;
  listItem.className = 'single-message';
 
  // Create a checkbox element and set its attributes
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'messageCheckbox';

  // Assign the id number to a data attribute on the checkbox
  checkbox.setAttribute('data-message-id', messageObject.id);

  // Apply styles to the checkbox
  //checkbox.style.marginLeft = '40px';
  checkbox.style.float = 'right';

  // Add event listener to handle checkbox changes
  checkbox.addEventListener('change', function() {
      // Get the message ID from the data attribute of the checkbox
      const messageId = parseInt(this.getAttribute('data-message-id'));

      if (this.checked) {
          // Add checked message ID to the array if it is checked
          checkedMessageIds.push(messageId);
          console.log('Checkbox with message-id ' + messageId + ' is checked.');
      } else {
          // Remove unchecked message ID from the array if it is unchecked
          const index = checkedMessageIds.indexOf(messageId);
          if (index !== -1) {
              checkedMessageIds.splice(index, 1);
          }
          console.log('Checkbox with message-id ' + messageId + ' is unchecked.');
          // Do something when the checkbox is unchecked
      }

      console.log('Checked users are: ', checkedMessageIds);
  });

  // Append the checkbox to the list item
  listItem.appendChild(checkbox);

  // Append the list item to the messagesList
  messagesList.appendChild(listItem);
}

function downloadMessages(){
  window.location.href = '/download';
}