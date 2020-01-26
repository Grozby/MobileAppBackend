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


    io.on('connection', async function (socket) {
        console.log("Client connected");
        let userId = await AccessToken.findOne({token: socket.handshake.headers.token})
                                      .then(a => a.toObject().userId)
                                      .catch(_ => null);
        let contacts = await ContactMentor.find({$or:[{menteeId: userId}, {mentorId:userId}]})
                                          .catch(_ => null);

        if(contacts != null) {
            contacts.forEach(function (c) {
                c = c.toObject();
                console.log("Joined room - ChatId: " + c._id.toString());
                socket.join(c._id.toString());
            })
        }

        socket.on('new_chat', async function (data) {
            //TODO implement actual history
            let history = [
                {
                    userId: "un id",
                    kind: "text",
                    content: "Bella",
                    date: 1502343862000
                },
                {
                    userId: "un id",
                    kind: "text",
                    content: "Come va boss?",
                    date: 1502171062000
                },
                {
                    userId: "un id",
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
            console.log("Message - Id: " + data.userId + " - ChatId: " + data.chatId);
            io.to(data.chatId).emit('message', {
                chatId: data.chatId,
                userId: data.userId,
                kind: data.kind,
                date: data.date,
                content: data.message,
            });
        });

        socket.on('typing', (data) => {
            console.log("Typing - Id: " + data.userId + " - ChatId: " + data.chatId);
            io.to(data.chatId).emit("typing", {
                chatId: data.chatId,
                userId: data.userId,
            });
        });

        socket.on('disconnect', function () {
            console.log('Client disconnected.');
        });
    });
};
