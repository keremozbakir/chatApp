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
