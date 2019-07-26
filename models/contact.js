const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
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
    sending_mentee: {
        type: String,
        required: true
    },
    receiving_mentor: {
        type: String,
        required: true
    },
    is_revealed: {
        type: Boolean,
        default: false
    },
    pending_tokens: {
        type: Number,
        required: true,
        default: 1
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
    message_list: {
        type: [messageSchema]
    }
});


// Methods
// This method returns the contact for a given couple of sender + receiver
contactSchema.statics.findBySenderAndReceiver = function (sender, receiver) {
    sender = sender.toString();
    receiver = receiver.toString();
    return Contact.findOne({$or:[
        {sending_mentee: sender, receiving_mentor:receiver}, {sending_mentee: receiver, receiving_mentor: sender}]}
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
        updated_at: now
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
            {sending_mentee: userId}, {receiving_mentor: userId}]}
    ).then(function (listOfContacts) {
        return Promise.resolve(listOfContacts);
    }).catch(function (err) {
        return Promise.reject(err);
    });

};

contactSchema.methods.retrieveMessageList = function(){
    var contact = this;
    // Return the list of skills for this user
    return contact.message_list;
};

contactSchema.methods.retrieveId = function(){
    var contact = this;
    // Return the list of skills for this user
    return contact._id;
};


contactSchema.statics.addMessageStatic = function (contactId, sender, text) {

    var message = new Message({
        username: sender,
        text: text,
        created_at: new Date()
    });

    return Contact.findOneAndUpdate({_id: contactId}, { $push: { message_list: message } }).then(function (result) {
        return Promise.resolve(message);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

contactSchema.methods.addMessage = function (sender, text) {

    var message = new Message({
        username: sender,
        text: text,
        created_at: new Date()
    });
    if(!this.message_list || this.message_list===0)
        this.message_list = [];
    this.message_list = this.message_list.concat(message);
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
    if ( !this.created_at ) {
        this.created_at = now;
    }
    next();
});


// Defining the model for the contact
var Contact = mongoose.model('Contact', contactSchema);


// Exporting
module.exports = {
    Contact,
    Message,
    ContactOption

};