const socket = io()

// document.getElementById('increment').addEventListener('click', () => {
//     socket.emit('increment')
// })
// socket.on('countUpdated', (count) => {
//     console.log('count updated: ', count)
// })

//Elements
const $messageForm = document.getElementById('messageForm')
const $messageInput = document.getElementById('messageTextBox')
const $sendMessaegButton = document.getElementById('sendMessageButton')
const $sendLocationButton = document.getElementById('sendLocationButton')
const $messages = document.getElementById('messages')
const $sidebar = document.getElementById('sidebar')

//Templates
const messageTemplate = document.getElementById('messageTemplate').innerHTML
const locationTemplate = document.getElementById('locationTemplate').innerHTML
const sidebarTemplate = document.getElementById('sidebarTemplate').innerHTML

//options
const {username, room} = Qs.parse(location.search/*contains query string*/,{ignoreQueryPrefix: true}) //used at the end (emit join)

const autoScroll = () => {
    //get the new message
    const $newMessage = $messages.lastElementChild

    //get the height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin //does not take into account the margin so we added the margin by getting the style of the element dynamically
    
    //Visible height
    const visibleHeight = $messages.offsetHeight //height of stuff we can see of this container (i.e height of the content that we can see based on the size of the window)

    //height of the message container
    const contianerHeight = $messages.scrollHeight //height of the whole thing

    //how far are we scrolled
    let scrollOffset = $messages.scrollTop //distance from the top (i.e at top = 0 and as you go down it increases)

    //how far are we scrolled from the bottom (no attribute specific to this)
    scrollOffset = scrollOffset + visibleHeight

    if (contianerHeight - newMessageHeight <= scrollOffset + 1){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', (roomData) =>{
    const html = Mustache.render(sidebarTemplate, {
        room: roomData.room,
        users: roomData.users,
    })

    $sidebar.innerHTML = html
})

$messageForm.addEventListener('submit', (e)=> {
    //e.target.elements //target is the form, and elements in everything inside of it, elements.name retruns an element with a specific name
    e.preventDefault()
    $sendMessaegButton.setAttribute('disabled', 'disabled')
    let message = document.getElementById('messageTextBox').value
   
    socket.emit('sendMessage', message, (error) => { // a function that runs when the message is recieved by the server (acknowlegement)
        $sendMessaegButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
        if (error){
            return console.log(error)
        }
        console.log('message recieved') 
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation){
        return alert('geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {latitude:position.coords.latitude, longitude:position.coords.longitude}, ()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if (error){
        alert(error)
        location.href='/'
    }
})

