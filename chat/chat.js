'use strict';


const {AccessToken} = require("../models/user");
const {ContactMentor} = require("../models/contact");


class Chat {

    async retrieveUserId(authToken) {
        return await AccessToken.findOne({token: authToken})
                                .then(a => a != null ? a.toObject().userId : null)
                                .catch(_ => null);
    }

    updatedContactRequest(chat, status) {
        if (status === 'accepted') {
            if(this.activeSockets.has(chat.mentorId)){
                let ac = this.activeSockets.get(chat.mentorId);
                ac.socket.join(chat._id.toString());
                ac.contacts.push(chat);
                this.activeSockets.set(chat.mentorId, ac);
            }

            if(this.activeSockets.has(chat.menteeId)){
                let ac = this.activeSockets.get(chat.menteeId);
                ac.socket.join(chat._id.toString());
                ac.contacts.push(chat);
                this.activeSockets.set(chat.menteeId, ac);
            }

            this.io.to(chat._id.toString()).emit('updated_contact_request', {
                'chatId': chat._id.toString(),
                'status': status,
            })
        }
    }

    constructor(s) {
        this.io = require('socket.io')(s);

        this.activeChats = new Map();
        this.activeSockets = new Map();

        this.io.use(async (socket, next) => {
            let userId = await this.retrieveUserId(socket.request.headers.token);
            if (userId != null) {
                next();
            } else {
                next(new Error("Unauthorized."));
            }
        });


        this.io.on('connection', async (socket) => {
            console.log("Client connected");
            let userId = await this.retrieveUserId(socket.handshake.headers.token);
            let contacts = await ContactMentor.find({$or: [{menteeId: userId}, {mentorId: userId}]})
                                              .catch(_ => null);

            this.activeSockets.set(userId, {
                socket: socket,
                contacts: contacts != null ? contacts : [],
            });

            if (contacts != null) {
                contacts.forEach(function (c) {
                    c = c.toObject();
                    if (c.status === 'accepted') {
                        socket.join(c._id.toString());
                        console.log("Joined room - ChatId: " + c._id.toString());
                    }
                })
            }

            socket.on('new_chat', async (data) => {
                if (this.activeSockets.get(userId).contacts.filter(function (c) {
                    return c._id.toString() === data.chatId && c.status === 'accepted';
                }).length === 0) {
                    return;
                }

                if (!this.activeChats.has(data.chatId)) {
                    this.activeChats.set(data.chatId, {
                        activeUsers: [userId],
                    });
                    console.log("Joined active listen room - ChatId: " + data.chatId + " - One active");
                } else if (!this.activeChats.get(data.chatId).activeUsers.includes(userId)) {
                    let users = this.activeChats.get(data.chatId).activeUsers;
                    users.push(userId);

                    this.activeChats.set(data.chatId, {
                        activeUsers: users,
                    });
                    console.log("Joined active listen room - ChatId: " + data.chatId + " - Two active");
                }
                // //TODO implement actual history

                // history.forEach(function (data) {
                //     socket.emit('message', data);
                // })
            });

            socket.on('leave_chat', async (data) => {
                if (this.activeChats.has(data.chatId) && this.activeChats.get(data.chatId).activeUsers.includes(userId)) {

                    if (this.activeChats.get(data.chatId).activeUsers.length === 1) {
                        this.activeChats.delete(data.chatId);
                        console.log("Exited active listen room a - ChatId: " + data.chatId);
                    } else {
                        this.activeChats.set(data.chatId, {
                            activeUsers: this.activeChats.get(data.chatId).activeUsers.filter(function (id, _1, _2) {
                                return id !== userId;
                            })
                        });
                        console.log("Exited active listen room - ChatId: " + data.chatId + " - One active");
                    }
                }
            });

            socket.on('message', async (data) => {
                if (!this.activeChats.has(data.chatId)) {
                    return;
                }

                let contact = await ContactMentor.findById(data.chatId)
                                                 .catch(_ => null);
                let messageJson = {
                    chatId: data.chatId,
                    userId: userId,
                    isRead: this.activeChats.get(data.chatId).activeUsers.length === 2,
                    kind: data.kind,
                    createdAt: data.createdAt,
                    content: data.content,
                };

                if (contact != null) {
                    contact.messages.splice(0, 0, messageJson);
                    contact.unreadMessages += 1;
                    await contact.save();
                    console.log();

                    this.io.to(data.chatId).emit('message', messageJson);
                    console.log("Message - Id: " + userId + " - ChatId: " + data.chatId);
                }


            });

            socket.on('typing', async (data) => {
                if (!this.activeChats.has(data.chatId)) {
                    return;
                }

                this.io.to(data.chatId).emit("typing", {
                    chatId: data.chatId,
                    userId: userId,
                });
                console.log("Typing - Id: " + userId + " - ChatId: " + data.chatId);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected.');
                this.activeSockets.delete(userId);
            });
        });
    }


}

module.exports = {
    chat: server => new Chat(server),
};
