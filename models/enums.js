const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema ({
    tag: {
        type: String,
        enum: ['Software Engineer','Full-Stack','Front-End','Back-End',
            'Machine Learning','Python','C++','iOS','Android','Mobile Dev'],
        required: true
    }
});

const questionSchema = new mongoose.Schema ({
    question: {
        type: String,
        enum: ['What are your favourite programming languages?',
            'What inspires you the most in your work?'],
        required: true
    },
    answer: {
        type:String,
        required: true
    }
});

module.exports = {
    tagSchema,
    questionSchema

};