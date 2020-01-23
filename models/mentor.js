const mongoose = require('mongoose');

const MentorSchema = new mongoose.Schema ({
    cost_in_tokens: {
        type: Number,
        default: 1
    },
});


module.exports.mentorSchema = MentorSchema;