'use strict';

let express = require('express');
let router = express.Router();

const {User} = require('../../models/user.js');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');

// obtain contact information for a given user.


router.get("/info/:id",
    function (req,res) {
        User.getContactInfo(req.params.id)
            .then((profileResponse)=> res.status(201).json(profileResponse))
            .catch((error)=> res.status(400).json(error))
    });

router.get("/info/quiz/:id",
    function (req,res) {
        User.getQuiz(req.params.id)
            .then((profileResponse)=> res.status(201).json(profileResponse))
            .catch((error)=> res.status(400).json(error))
    });

module.exports = router;

