const mongoose = require('mongoose');

// Definition of the schema

let answerQuestionSchema = new mongoose.Schema({
    question: {type: String},
    textAnswer: {type: String},
    audioAnswer: {type: String},
}, {_id: false});

let messageSchema = new mongoose.Schema({
    userId: {type: String},
    isRead: {type: Boolean},
    content: {
        type: String,
        required: true
    },
    kind: {
        type: String,
        required: true,
        enum: ['text', 'audio']
    },
    createdAt: {
        type: Date,
        required: true
    }
});

let contactMentorSchema = new mongoose.Schema(
    {
        menteeId: {type: String},
        mentorId: {type: String},
        startingMessage: {type: String},
        status: {
            type: String,
            enum: ["accepted", "refused", "pending"],
            default: "pending"
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        answers: [answerQuestionSchema],
        messages: [messageSchema],
        unreadMessages: {type: Number, default: 0}
    }
);

contactMentorSchema.index({menteeId: 1, mentorId: 1}, {unique: true});

contactMentorSchema.methods.getMessages = function (param, cb) {
    return this.messages;
};

contactMentorSchema.options.toObject = {
    transform: function (doc, ret) {
        return ret;
    }
};

let ContactMentor = mongoose.model('ContactMentor', contactMentorSchema);

module.exports = {
    ContactMentor: ContactMentor
};