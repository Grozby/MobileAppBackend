'use strict';


const {AccessToken} = require("../models/user");
const {ContactMentor} = require("../models/contact");
let ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (s) {
    let io = require('socket.io')(s);

    let activeChats = new Map();

    io.use(async function (socket, next) {
        let token = socket.request.headers.token;

        await AccessToken.findOne({token: token})
                         .then(result => result != null ? next() : next(new Error("Not authorized.")))
                         .catch(_ => next(new Error("Not authorized.")));
    });


    io.on('connection', async function (socket) {
        console.log("Client connected");
        let userId = await AccessToken.findOne({token: socket.handshake.headers.token})
                                      .then(a => a.toObject().userId)
                                      .catch(_ => null);
        let contacts = await ContactMentor.find({$or: [{menteeId: userId}, {mentorId: userId}]})
                                          .catch(_ => null);


        if (contacts != null) {
            contacts.forEach(function (c) {
                c = c.toObject();
                socket.join(c._id.toString());
                console.log("Joined room - ChatId: " + c._id.toString());
            })
        }

        socket.on('new_chat', async function (data) {
            if (!activeChats.has(data.chatId)) {
                activeChats.set(data.chatId, {
                    activeUsers: [data.userId],
                });
                console.log("Joined active listen room - ChatId: " + data.chatId + " - One active");
            }
            else if (!activeChats.get(data.chatId).activeUsers.includes(data.userId)) {
                activeChats.set(data.chatId, {
                    activeUsers: [activeChats.get(data.chatId).userId, data.userId],
                });
                console.log("Joined active listen room - ChatId: " + data.chatId + " - Two active");
            }
            // //TODO implement actual history
            // let history = [
            //     {
            //         userId: "un id",
            //         kind: "text",
            //         content: "Bella",
            //         date: 1502343862000
            //     },
            //     {
            //         userId: "un id",
            //         kind: "text",
            //         content: "Come va boss?",
            //         date: 1502171062000
            //     },
            //     {
            //         userId: "un id",
            //         kind: "text",
            //         content: "sup",
            //         date: 1502261062000
            //     }
            // ];
            //
            // history.forEach(function (data) {
            //     socket.emit('message', data);
            // })
        });

        socket.on('leave_chat', function (data) {
            if (activeChats.has(data.chatId) && activeChats.get(data.chatId).activeUsers.includes(data.userId)) {

                if (activeChats.get(data.chatId).activeUsers.length === 1) {
                    activeChats.delete(data.chatId);
                    console.log("Exited active listen room a - ChatId: " + data.chatId);
                } else {
                    activeChats.set(data.chatId, {
                        activeUsers: activeChats.get(data.chatId).activeUsers.filter(function (userId, index, arr) {
                            return userId !== data.userId;
                        })
                    });
                    console.log("Exited active listen room - ChatId: " + data.chatId + " - One active");
                }
            }
        });

        socket.on('message', function (data) {
            if(!activeChats.has(data.chatId)){
                return;
            }

            io.to(data.chatId).emit('message', {
                chatId: data.chatId,
                userId: data.userId,
                isRead: activeChats.get(data.chatId).activeUsers.length === 2,
                kind: data.kind,
                createdAt: data.createdAt,
                content: data.content,
            });
            console.log("Message - Id: " + data.userId + " - ChatId: " + data.chatId);
        });

        socket.on('typing', (data) => {
            if(!activeChats.has(data.chatId)){
                return;
            }

            io.to(data.chatId).emit("typing", {
                chatId: data.chatId,
                userId: data.userId,
            });
            console.log("Typing - Id: " + data.userId + " - ChatId: " + data.chatId);
        });

        socket.on('disconnect', function () {
            console.log('Client disconnected.');
        });
    });
};
