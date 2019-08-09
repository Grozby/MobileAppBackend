const {Contact,Message} = require('./contact.js');

var message = new Message({
    messageSender: 'Flavio',
    content: 'Hello',
    createdAt: new Date()
});

//console.log(JSON.stringify(message));

var contact = new Contact({
    status: 'accepted',
    sender: 'Flavio',
    receiver: 'Artu',
    is_revealed: false,
    createdAt: new Date(),
    messageList: [message]
})

//contact.save()

Contact.findBySenderAndReceiver('Flavio','Artu')
    .then((result)=>{
        //console.log(result)
        return result.addMessage('Flaio','Hello, it s me')
    }).then((result)=>console.log(result)).catch((err)=>{console.log(err)});
