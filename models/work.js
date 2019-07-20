const mongoose = require('mongoose');
const institution = require('./institution');

const workSchema = new mongoose.Schema ({

    company: {
        type: institution.institutionSchema,
        required: true
    },
    role: {
        type: String,
        required: true,
    },
    description: {
        type: String
    }
});

module.exports.workSchema = workSchema;