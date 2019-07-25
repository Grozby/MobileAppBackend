const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');

const MentorSchema = new mongoose.Schema ({
    referralCompany: {
        type: String,
        es_indexed: true,   //ELASTICSEARCH INDEX
        required: [true, 'To become a mentor you must work for a company']
    },
    workingRole: {
        type: String,
        es_indexed: true   //ELASTICSEARCH INDEX
    },
    cost_in_tokens: {
        type: Number,
        default: 1
    },
});

// Using Mongoosastic to replicate on ElasticSearch

module.exports.mentorSchema = MentorSchema;