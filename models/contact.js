const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    messageSender: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    kind:{
        type: String,
        required: true,
        enum: ['text','audio']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: true
    }
});

var Message = mongoose.model('Message', messageSchema);

var contactSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["accepted","refused","pending"],
        default: "pending"
    },
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: true
    },
    updatedAt: {
        type: Date
    },
    messageList: {
        type: [messageSchema],
        required:true
    }
});

contactSchema.index({ sender: 1, receiver: 1 }, { unique: true });

// Methods
// This method returns the contact for a given couple of sender + receiver
contactSchema.statics.findBySenderAndReceiver = function (sender, receiver) {
    sender = sender.toString();
    receiver = receiver.toString();
    return Contact.findOne({$or:[
        {sender: sender, receiver:receiver}, {sender: receiver, receiver: sender}]}
    )
};

// Schema method to find a single contact, given its id
contactSchema.statics.findById = function(contactId) {
    return Contact.findOne({
        _id: contactId
    }).then(function (foundContact) {
        return new Promise(function (resolve, reject) {
            if(!foundContact)
                reject("Contact was not found by ID");
            else
                resolve(foundContact);
        });
    });
};

// Schema method to change the status of a contact
contactSchema.statics.updateStatus = function (contactId, newStatus) {
    now = new Date();
    return Contact.updateOne({_id: contactId}, {
        status: newStatus,
        updatedAt: now
    }).then(function (result) {
        return Promise.resolve(result);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Schema method to retrieve all contacts for a specific user
contactSchema.statics.retrieveAllContactsForUser = function(userId){
    userId = userId.toString();

    return Contact.find({$or:[
            {sender: userId}, {receiver: userId}]}
    ).then(function (listOfContacts) {
        return Promise.resolve(listOfContacts);
    }).catch(function (err) {
        return Promise.reject(err);
    });

};

contactSchema.methods.retrieveMessageList = function(){
    var contact = this;
    // Return the list of skills for this user
    return contact.messageList;
};

contactSchema.methods.retrieveId = function(){
    var contact = this;
    // Return the list of skills for this user
    return contact._id;
};

contactSchema.statics.addMessageStatic = function (contactId, sender, text) {
    var message = new Message({
        messageSender: sender,
        content: text,
        createdAt: new Date()
    });

    return Contact.findOneAndUpdate({_id: contactId}, { $push: { messageList: message } }).then(function (result) {
        return Promise.resolve(message);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

contactSchema.methods.addMessage = function (sender, text) {

    var message = new Message({
        messageSender: sender,
        content: text,
        createdAt: new Date()
    });
    if(!this.messageList || this.messageList===0)
        this.message_list = [];
    this.message_list = this.messageList.concat(message);
    console.log(this._id);
    return this.update().then(function(){
        return Promise.resolve(message)
    }).catch(function(err){
        return Promise.reject(err)
    })
};

// Pre method to set creation timestamp
contactSchema.pre('save', function(next){
    now = new Date();
    if ( !this.createdAt ) {
        this.createdAt = now;
    }
    next();
});

// Defining the model for the contact
var Contact = mongoose.model('Contact', contactSchema);

// Exporting
module.exports = {
    Contact,
    Message
};