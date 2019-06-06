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

//receive message from node server
socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

//receive user location from node server
socket.on('locationMessage', (url)=>{
    console.log(url)
    const html = Mustache.render(geolocationTemplate,{
        url
    })
    $messages.insertAdjacentHTML('beforeend', html)
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