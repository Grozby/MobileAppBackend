'use strict';



module.exports = function(s){
    let io = require('socket.io')(s);

    io.use(function(socket, next) {
        var handshakeData = socket.request;
        // make sure the handshake data looks good as before
        // if error do this:
        // next(new Error('not authorized'));
        // else just call next
        next();
    });

    io.on('connection', function(socket) {
        socket.on('new_room', async function(data) {
            await AccessToken.findById(data.user.token)
            //data.userToken
            socket.join(data.roomId);

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

            history.forEach(function(data) {
                socket.emit('message', data);
            })
        });

        socket.on('message', function(data) {
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
