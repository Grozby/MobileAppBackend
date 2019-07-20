const {Contact,Message} = require('./contact.js');

var message = new Message({
    username: 'Flavio',
    text: 'Hello',
    created_at: new Date()
});

//console.log(JSON.stringify(message));

var contact = new Contact({
    status: 'accepted',
    sending_mentee: 'Flavio',
    receiving_mentor: 'Artu',
    is_revealed: false,
    created_at: new Date(),
    message_list: [message]
})

//contact.save()

Contact.findBySenderAndReceiver('Flavio','Artu')
    .then((result)=>{
        //console.log(result)
        return result.addMessage('Flaio','Hello, it s me')
    }).then((result)=>console.log(result)).catch((err)=>{console.log(err)});
