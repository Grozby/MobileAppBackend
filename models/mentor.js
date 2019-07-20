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
        es_indexed: true,   //ELASTICSEARCH INDEX
        required: [true, 'To become a mentor you must specify your working position']
    },
    state: {
        type: String,
        es_indexed: true,   //ELASTICSEARCH INDEX
        required: [true, 'To become a mentor you must specify the State you are working in']
    },
    cost_in_tokens: {
        type: Number,
        default: 1
    },
    pseudonym: {
        type: String,
        es_indexed: true,   //ELASTICSEARCH INDEX
        trim: true,
        min: 1,
        default: 'Piccione Anonimo',
        required: true
    }});


// Using Mongoosastic to replicate on ElasticSearch


module.exports.mentorSchema = MentorSchema;