const mongoose = require('mongoose');

const MenteeSchema = new mongoose.Schema ({
    tokens_wallet: {
        type: Number,
        default: 3
    }
});

module.exports.menteeSchema = MenteeSchema;