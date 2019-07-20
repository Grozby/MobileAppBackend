const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    profilePic: {
        type: mongoose.SchemaTypes.Url,
        default: "https://ui-avatars.com/api/?background=0D8ABC&color=fff"
    },
});

module.exports.institutionSchema = institutionSchema;