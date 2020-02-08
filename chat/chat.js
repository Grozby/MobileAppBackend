'use strict';


const {AccessToken} = require("../models/user");
const {ContactMentor} = require("../models/contact");
const {User} = require('../models/user.js');
var admin = require('firebase-admin');
var serviceAccount = require('./../config/mobileapplicationadpcorp-firebase-adminsdk-gl2e4-8db24eae64');
admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mobileapplicationadpcorp.firebaseio.com"
});

class Chat {

    async retrieveUserId(authToken) {
        return await AccessToken.findOne({token: authToken})
                                .then(a => a != null ? a.toObject().userId : null)
                                .catch(_ => null);
    }

    async updatedContactRequest(contact, status) {
        if (contact.status === 'accepted') {

            if (this.activeChats.has(contact._id.toString())) {
                let chatData = this.activeChats.get(contact._id.toString());
                chatData.contactDoc.status = 'accepted';
                await chatData.contactDoc.save();
                this.activeChats.set(contact._id.toString(), {
                    activeUsers: chatData.activeUsers,
                    contactDoc: chatData.contactDoc,
                })
            }


            if (this.activeSockets.has(contact.mentorId)) {
                let socket = this.activeSockets.get(contact.mentorId);
                socket.join(contact._id.toString());
            }

            if (this.activeSockets.has(contact.menteeId)) {
                let ac = this.activeSockets.get(contact.menteeId);
                ac.socket.join(contact._id.toString());
            }

            this.io.to(contact._id.toString()).emit('updated_contact_request', {
                'chatId': contact._id.toString(),
                'status': contact.status,
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
            let userInfo = await User.findByIdAndUpdate(userId, {fcmToken: socket.handshake.headers.fcmtoken}, {new: true});
            let contacts = await ContactMentor.find({$or: [{menteeId: userId}, {mentorId: userId}]})
                                              .catch(_ => null);


            this.activeSockets.set(userId, socket);

            if (contacts != null) {
                contacts.forEach((c) => {
                    if (c.status === 'accepted') {
                        socket.join(c._id.toString());
                        this.io.to(c._id.toString()).emit('online', {
                            chatId: c._id.toString(),
                            userId: userId,
                        });
                        if (!this.activeChats.has(c._id.toString())) {
                            this.activeChats.set(c._id.toString(), {
                                activeUsers: [],
                                contactDoc: c,
                            });
                        }

                        console.log("Joined room - ChatId: " + c._id.toString() + " - User: " + userId);
                    }
                })
            }

            socket.emit('had_active_chat', {});

            socket.on('new_chat', async (data) => {
                if (!this.activeChats.has(data.chatId)) {
                    return;
                }

                let chatData = this.activeChats.get(data.chatId);

                if (chatData.contactDoc.mentorId !== userId && chatData.contactDoc.menteeId !== userId) {
                    return;
                }

                if (chatData.activeUsers.includes(userId)) {
                    return;
                }

                let i = 0;
                while (!chatData.contactDoc.messages[i].isRead && chatData.contactDoc.messages[i].userId !== userId) {
                    chatData.contactDoc.messages[i].isRead = true;
                    i += 1;
                }

                await chatData.contactDoc.save();
                chatData.activeUsers.push(userId);

                this.activeChats.set(data.chatId, chatData);

                if (chatData.activeUsers.length === 1) {
                    console.log("Joined active listen room - ChatId: " + data.chatId + " - One active");
                } else {
                    console.log("Joined active listen room - ChatId: " + data.chatId + " - Two active");
                }
            });

            socket.on('leave_chat', async (data) => {
                if (!this.activeChats.has(data.chatId)) {
                    return;
                }

                let chatData = this.activeChats.get(data.chatId);

                if (chatData.contactDoc.mentorId !== userId && chatData.contactDoc.menteeId !== userId) {
                    return;
                }

                if (!chatData.activeUsers.includes(userId)) {
                    return;
                }

                chatData.activeUsers = chatData.activeUsers.filter(function (id) {
                    return id !== userId;
                });

                this.activeChats.set(data.chatId, {
                    activeUsers: chatData.activeUsers,
                    contactDoc: chatData.contactDoc,
                });

                if (chatData.activeUsers.length === 0) {
                    console.log("Exited active listen room a - ChatId: " + data.chatId);
                } else {
                    console.log("Exited active listen room - ChatId: " + data.chatId + " - One active");
                }
            });

            socket.on('message', async (data) => {
                if (!this.activeChats.has(data.chatId)) {
                    return;
                }
                let chatData = this.activeChats.get(data.chatId);

                if (chatData.contactDoc.mentorId !== userId && chatData.contactDoc.menteeId !== userId) {
                    return;
                }
                if (!chatData.activeUsers.includes(userId)) {
                    return;
                }

                let messageJson = {
                    chatId: data.chatId,
                    userId: userId,
                    isRead: chatData.activeUsers.length === 2,
                    kind: data.kind,
                    createdAt: data.createdAt,
                    content: data.content,
                };

                chatData.contactDoc.messages.splice(0, 0, messageJson);
                await chatData.contactDoc.save();

                let otherId = userId === chatData.contactDoc.mentorId
                    ? chatData.contactDoc.menteeId
                    : chatData.contactDoc.mentorId;
                let userLean = await User.findById(otherId, 'fcmToken').lean();

                let message = {
                    notification: {
                        title: userInfo.name + " " + userInfo.surname,
                        body: data.content,
                    },
                    data: {
                      when: data.createdAt,
                    },
                    token: userLean.fcmToken
                };


                admin.messaging().send(message)
                     .then((response) => {
                         // Response is a message ID string.
                         console.log('Successfully sent message:', response);
                     })
                     .catch((error) => {
                         console.log('Error sending message:', error);
                     });

                this.io.to(data.chatId).emit('message', messageJson);
                console.log("Message - Id: " + userId + " - ChatId: " + data.chatId);
            });

            socket.on('typing', async (data) => {
                if (!this.activeChats.has(data.chatId)) {
                    return;
                }
                let chatData = this.activeChats.get(data.chatId);

                if (chatData.contactDoc.mentorId !== userId && chatData.contactDoc.menteeId !== userId) {
                    return;
                }
                if (!chatData.activeUsers.includes(userId)) {
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
                if (contacts != null) {
                    contacts.forEach(value => {
                        this.io.emit('offline', {
                            chatId: value._id.toString(),
                            userId: userId,
                        })
                    });
                }

                this.activeSockets.delete(userId);
            });
        });
    }


}

module.exports = {
    chat: server => new Chat(server),
};
