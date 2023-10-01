const socket = io('http://localhost:3000');
var messagesUpdated = false; // Only load old messages once for every user 
var maxMessage = 10
var loadMore = false;
socket.on('loadMessages',allMessages=>{
    console.log('loadMessages socket running! ')
    console.log('already updated : ',messagesUpdated)
    if(!messagesUpdated){
      allMessages.forEach(element => {
        if(element.isAdmin){ 
          addMessageToListClient(element.message,'pushMessages') // only view admin messages which are push messages
        }else{
            addMessageToListClient(element.message,'chatMessages') // only chat messages
        }
       });
       messagesUpdated=true
    }
})

socket.on('updateMessages',updatedMessage=>{
    console.log("updateMessages socket running on client side" )
    console.log(updatedMessage)
    if(updatedMessage.isAdmin){
        addMessageToListClient(updatedMessage.message,'pushMessages') // only view admin messages which are push messages
    }else{
        addMessageToListClient(updatedMessage.message,'chatMessages') // only chat messages
    }
})


 

function addMessageToListClient(message, messageType ) {
    console.log('addMessage function running!', message);
    const messagesList = document.getElementById(messageType);
    const listItem = document.createElement('li');
    listItem.textContent = message;
    messagesList.appendChild(listItem); // Append the new li element to messagesList
    
    if(messageType==='chatMessages'){ // limit only chat messages not push messages
        // Get all list items in the messages list
         const listItems = Array.from(messagesList.getElementsByTagName('li'));
    
        // If there are more than `maxMessage` list items, remove the first ones
        if (listItems.length > maxMessage) {
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
    
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url; // Redirect to the URL sent by the server
        } else {
            return response.json(); // Handle other responses if needed
        }
    })
    .then(data => {
        // Handle JSON response if needed
    })
    .catch(error => {
        // Handle errors if any
        console.error('Error:', error);
    });
}

    
 




