const mongoose = require('mongoose');
const schoolDegree = require('./education');
const work = require('./work');
const institution = require('./institution');
const options = {discriminatorKey: 'kind', _id : false};


const experienceSchema = new mongoose.Schema({
    institution: {
        type: institution.institutionSchema,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
    },
}, options);

// Defining the experience models
let Experience = mongoose.model('experience', experienceSchema);
let SchoolDegree = Experience.discriminator('Education', schoolDegree.schoolDegreeSchema);
let Work = Experience.discriminator('Job', work.workSchema);

// Exporting
module.exports = {
    experienceSchema,
    Experience,
    Education: SchoolDegree,
    Work,
};