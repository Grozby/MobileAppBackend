const mongoose = require('mongoose');

const workSchema = new mongoose.Schema ({
    workingRole: {
        type: String,
        required: true,
    }
}, {_id : false});

module.exports.workSchema = workSchema;