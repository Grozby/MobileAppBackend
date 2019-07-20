const mongoose = require('mongoose');
const schoolDegree = require('./education');
const work = require('./work');

var options = {discriminatorKey: 'kind'};


const experienceSchema = new mongoose.Schema ({
    fromDate: {
        type: Date,
        required: true
    },

    toDate: {
        type: Date,
    },

    nowDoing: {         // If this boolean is true, then the user is still doing this experience in the present (so there is no need of toMonth and toYear)
        type: Boolean,
        default: false
    }
},options);

// Defining the experience models
var Experience  = mongoose.model('experience',experienceSchema);
var SchoolDegree = Experience.discriminator('Education',schoolDegree.schoolDegreeSchema);
var Work = Experience.discriminator('Work',work.workSchema);

// Exporting
module.exports = {
    experienceSchema,
    Experience,
    Education: SchoolDegree,
    Work,
};