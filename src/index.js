const path = require('path')
const http = require('http')
const express = require('express')
const messages = require('./utils/messages')
const socketio = require('socket.io')
const Filter = require('bad-words')
const users = require('./utils/users')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)
//app.use(express.json())

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

//let count = 0

io.on('connection', (socket) => {
    console.log('new connection')
   
    socket.on('join', ({username, room}, callback)=>{

        const res = users.addUser({id: socket.id, username, room})
        if (res.error){
            return callback(res.error)
        }
        socket.join(res.user.room)
        //allows using io.to().emit (where to() takes a specific room), socket.broadcast.to.emit

        socket.emit('message', messages.generateMessage('System','Welcome!'))
        socket.broadcast.to(res.user.room).emit('message',messages.generateMessage('System',`${res.user.username} has joined the room`)) //sends to everyone except the socket's owner
        io.to(res.user.room).emit('roomData', {
            room: res.user.room,
            users: users.getUsers(res.user.room)
        })
        callback()
    })
    
    socket.on('sendMessage', (message, callback) => {
        const user = users.getUser(socket.id)
        if (!user) return callback('this should not occur but if you see this, well, rip')
        const filter = new Filter()

        if (filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', messages.generateMessage(user.username, message))
        callback() //we can provide params and access them at the client
    })
    
    // socket.emit('countUpdated', count)
    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count) will emit to only the event sender
    //     io.emit('countUpdated',count) //to all connections
    // })


    socket.on('sendLocation', (position, callback)=>{
        //socket.broadcast.emit('locationMessage', messages.generateLocation(`https://google.com/maps?q=${position.latitude},${position.longitude}`))

        const user = users.getUser(socket.id)
        if (!user) return callback('this should not occur but if you see this, well, rip')

        io.to(user.room).emit('locationMessage', messages.generateLocation(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = users.removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message', messages.generateMessage('System',`${user.username} has disconnected`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: users.getUsers(user.room)
            })
        }
    })
})




server.listen(port, () => {
    console.log('server is up on port', +port)
})