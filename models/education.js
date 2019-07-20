const mongoose = require('mongoose');
const institution = require('./institution')

const schoolDegreeSchema = new mongoose.Schema ({
    university: {
        type: institution.institutionSchema,
        required: true
    },
    degreeType: {
        type: String,
        required: true,
    },
    major: {
        type:String,
        required: true
    },
    GPA: {
        type: Number
    }
});


module.exports.schoolDegreeSchema = schoolDegreeSchema;