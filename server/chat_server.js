const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {mongoose} = require('../db/mongoose.js');

const {Contact,Message} = require('../models/contact');

const { generateMessage, generateLocationMessage } = require('./src/utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./src/utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    /*
    socket.on('join', (messageSender, callback) => {
        const { error, user } = addUser({ id: socket.id, messageSender })
        if (error) {
            return callback(error)
        }

        //socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.messageSender} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback()
    })
    */

    socket.on('chatWith', ({username,receiver}, callback) => {

        const { error, user } = addUser({ id: socket.id, username: senderId })
        if (error) {
            return callback(error)
        }

        Contact.findBySenderAndReceiver(username,receiver).then(function(chat_room){
            if (chat_room == null){
                return console.log('No chat available')

                //create new chatroom - Not possible since a contact request is created only by a request.
            }
            messageList = chat_room.retrieveMessageList();
            socket.join(chat_room.retrieveId());
            message_list.forEach(function(message){
                socket.emit('message', message);
            });

            socket.on('sendMessage', (message, callback) => {
                const user = getUser(socket.id);
                // authentication stuff

                /*
                const filter = new Filter()

                if (filter.isProfane(message)) {
                    return callback('Profanity is not allowed!')
                }

                */
                Contact.addMessageStatic(chat_room.retrieveId(),user.messageSender,message).then((result_message)=>
                    io.to(chat_room.retrieveId()).emit('message',result_message)
                ).catch((err)=> console.log(err))
                callback()
            })

        })
            .catch(function(error){console.log(error)});

        /*
        const { error } = addUser({ id: socket.id, messageSender });
        if (error) {
            return callback(error)
        }
        */

        //socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.messageSender} has joined!`))
        /*
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        */

        callback()
    })


    socket.on('disconnect', () => {
        //const user = removeUser(socket.id)
        /*
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.messageSender} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }*/
        console.log('User disconnected')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})