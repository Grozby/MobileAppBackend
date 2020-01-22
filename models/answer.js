const mongoose = require('mongoose');

// Definition of the schema

let answerQuestion = new mongoose.Schema({
    question: {type: String},
    textAnswer: {type: String},
    audioAnswer: {type: String},
}, {_id: false});

let answersQuestions = new mongoose.Schema(
    {
        menteeId: {type: String},
        mentorId: {type: String},
        answers: [answerQuestion]
    }
);


let AnswersQuestions = mongoose.model('AnswersQuestions', answersQuestions);

module.exports = {
    AnswersQuestions
};