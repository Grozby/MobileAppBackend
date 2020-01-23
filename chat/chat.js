'use strict';


const {AccessToken} = require("../models/user");
const {ContactMentor} = require("../models/contact");
let ObjectId = require('mongoose').Types.ObjectId;

module.exports = function (s) {
    let io = require('socket.io')(s);

    io.use(async function (socket, next) {
        let token = socket.request.headers.token;

        await AccessToken.findOne({token: token})
                         .then(result => result != null ? next() : next(new Error("Not authorized.")))
                         .catch(_ => next(new Error("Not authorized.")));
    });

    io.on('connection', function (socket) {
        socket.on('new_chat', async function (data) {
            let contact = await ContactMentor.findById(data.chatId)
                                             .catch(_ => null);
            if (contact === null) {
                return socket.emit("exception", "No contact with mentor selected mentor.");
            }

            let userId = await AccessToken.findOne({token: data.userToken}, 'userId', { lean: true })
                                          .then(r => r.userId)
                                          .catch(_ => null);

            if (contact.mentorId !== userId && contact.menteeId !== userId) {
                return socket.emit("exception", "What are you up to, stranger?");
            }


            //data.userToken
            socket.join(data.chatId);

            //TODO implement actual history
            let history = [
                {
                    user: "un id",
                    kind: "text",
                    content: "Bella",
                    date: 1502343862000
                },
                {
                    user: "un id",
                    kind: "text",
                    content: "Come va boss?",
                    date: 1502171062000
                },
                {
                    user: "un id",
                    kind: "text",
                    content: "sup",
                    date: 1502261062000
                }
            ];

            history.forEach(function (data) {
                socket.emit('message', data);
            })
        });

        socket.on('message', function (data) {
            io.to(data.roomId).emit('message', {
                kind: data.kind,
                date: data.date,
                content: data.message,
            });
        });

        socket.on('typing', (data) => {
            io.to(data.roomId).emit("typing", {
                userId: data.userId,
            });
        });

        socket.on('stop typing', (data) => {
            io.to(data.roomId).emit('stop typing', {
                userId: data.userId,
            });
        });

    });
};
