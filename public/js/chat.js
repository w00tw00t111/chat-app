const socket = io()

socket.on('welcomeMessage', (message)=>{
    console.log(message)
})

document.querySelector('#sendMessage').addEventListener('click',(e)=>{
    e.preventDefault()
    let message = document.querySelector('#messageText').value
    //send message to node server
    socket.emit('sendMessage', message)
})

//receive message from node server
socket.on('broadcastMessage', (message)=>{
    console.log(message)
})