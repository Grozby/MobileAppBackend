const mongoose = require('mongoose');

// Definition of the schema

let questionsForAcceptingRequestSchema = new mongoose.Schema({
    question: {type: String},
    availableTime: {type: Number}
}, {_id: false});

module.exports = {
    questionsForAcceptingRequestSchema: questionsForAcceptingRequestSchema
};