const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema ({
    name: {
        type: String,
        required: true
    },
    pictureUrl: {
        type: mongoose.SchemaTypes.String,
    },
},  {_id : false});

module.exports.institutionSchema = institutionSchema;