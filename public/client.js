const socket = io('http://localhost:3000');
var messagesUpdated = false; // Only load old messages once for every user 
var maxMessage = 10
var loadMore = false;

socket.on('loadMessages',allMessages=>{
 
    if(!messagesUpdated){
      allMessages.forEach(element => {
        if(element.isAdmin){ 
          addMessageToListClient(element,'pushMessages') // only view admin messages which are push messages
        }else{
            addMessageToListClient(element,'chatMessages') // only chat messages
        }
       });
       messagesUpdated=true
    }
})

socket.on('updateMessages',updatedMessage=>{
    
    if(updatedMessage.isAdmin){
        addMessageToListClient(updatedMessage,'pushMessages') // only view admin messages which are push messages
    }else{
        addMessageToListClient(updatedMessage,'chatMessages') // only chat messages
    }
})
 
socket.on('delete push from dom',incomingIDS=>{
     deletePushMessageView(incomingIDS)
})
 

function addMessageToListClient(messageObject, messageType ) {
    
    const messagesList = document.getElementById(messageType);
    const listItem = document.createElement('div');
    listItem.textContent = messageObject.message;
    listItem.className = 'single-message';
    listItem.setAttribute('data-message-id', messageObject.id);
    messagesList.appendChild(listItem); // Append the new li element to messagesList
    
    if(messageType==='chatMessages'){ // limit only chat messages not push messages
        // Get all list items in the messages list
        
        const listItems = Array.from(messagesList.getElementsByTagName('div'));
        console.log(listItems.length)
        // If there are more than `maxMessage` list items, remove the first ones
        if (listItems.length >= maxMessage) {
            console.log("deleting first message....")
            listItems.slice(0, listItems.length - maxMessage).forEach(item => item.remove());
        }
    }
}


function sendMessage() {
    var messageInput = document.getElementById('chatInput');
    var messageText = messageInput.value.trim(); // Get the value of the input field and trim any whitespace
    if (messageText !== "") {  // Check if the message is not empty
        var message = {
            message: messageText,
            isAdmin: false
        };
        socket.emit('message incoming', message);  // Emit the message to the server
        messageInput.value = ''; // Clear the input field
    } else {
        console.log('Empty message, not sending.'); // If the message is empty, do nothing
    }
}

function loadMoreMessage() { // Option to load additional 5 more messages .Default is 10
    var sendMessageButton = document.querySelector('.more-message');
    if (sendMessageButton.textContent === 'Load More') {
        maxMessage += 5;
        sendMessageButton.textContent = 'Load Less';
    } else {
        maxMessage -= 5;
        sendMessageButton.textContent = 'Load More';
    }

}


function loginUser(email, password) {
    
    fetch('/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        
        if (response.redirected) {
            window.location.href = response.url; // Redirect to the URL sent by the server
        } else if(response.status === 401) {
            document.getElementById('error-message').textContent = 'Invalid email or password. Please try again.'; // Sending error message on wrong credentials

        }else{
            return response.json(); // Handle other responses if needed
        }
    })
    .catch(error => {
        
        console.error('Error:', error);
    });
}



function deletePushMessageView(arrayOfIds) {  //  remove element from the DOM
  var elementsToDelete = {};
  // Find elements with specified message IDs and store them in the elementsToDelete object
  arrayOfIds.forEach(function(messageId) {
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

 // socket.emit('delete push from dom',checkedMessageIds) // passing list of message ids of push messages to be deleted from DOM
}
 




