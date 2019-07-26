const mongoose = require('mongoose');

// Definition of the schema

var contactOptionSchema = new mongoose.Schema({
    kind: {
        type: String,
        required: true,
        default: 'SimpleText',
        enum: ['SimpleText','Quiz']
    },
    question: {type: String},
    timeInMinutes: {type: Number}
});

module.exports = {
    contactOptionSchema
};