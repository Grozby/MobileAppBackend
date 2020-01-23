const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        enum: [
            'What are your favourite programming languages?',
            'What inspires you the most in your work?',
        ],
        required: true
    },
    answer: {
        type: String,
        required: true
    }
}, {_id: false});

module.exports = {
    questionSchema
};