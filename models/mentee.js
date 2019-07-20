const mongoose = require('mongoose');
//const skill = require('./skill');

const MenteeSchema = new mongoose.Schema ({
    /*skillList: {
        type: [skill.skillSchema]
    },
    */
    tokens_wallet: {
        type: Number,
        default: 3
    }
});


module.exports.menteeSchema = MenteeSchema;