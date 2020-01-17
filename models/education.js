const mongoose = require('mongoose');

const schoolDegreeSchema = new mongoose.Schema({
    degreeLevel: {
        type: String,
        required: true,
    },
    fieldOfStudy: {
        type: String,
        required: true,
    },
}, {_id : false});

module.exports.schoolDegreeSchema = schoolDegreeSchema;