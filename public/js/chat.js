const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $geolocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const geolocationTemplate = document.querySelector('#geolocation-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//receive message from node server
socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//receive user location from node server
socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(geolocationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//receive all users in room
socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageFormButton.addEventListener('click',(e)=>{
    e.preventDefault()
    //disable button
    $messageFormButton.setAttribute('disabled','disabled')

    let message = document.querySelector('#messageText').value
    //send message to node server
    socket.emit('sendMessage', message, (error)=>{
        //after message is sent, re-enable and clear text box
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered')
    })
})

//Send current user's latitude and longitude location
$geolocationButton.addEventListener('click', (e)=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    //disable button while location is being retrieved
    $geolocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        let latitude = position.coords.latitude
        let longitude = position.coords.longitude

        socket.emit('sendLocation', {latitude, longitude}, ()=>{
            console.log('Location Shared')
            //re-enable button after location is sent
            $geolocationButton.removeAttribute('disabled')
        })
    })

})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})