'use strict';

let express = require('express');
let router = express.Router();
const lodash = require('lodash');
const config = require('./configHandlers');

const errorParse = require('../../controller/error_parser');
const {User} = require('../../models/user.js');
const {Contact,Message} = require('../../models/contact.js');
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

router.post("/send/:id",
    config.generalAuth,
    function (req,res) {
        let senderId = req.user.id;
        req.body = lodash.pick(req.body, ['kind', 'content']);
        console.log(req.body);
        // here check if the mentee has enough token

        let message = new Message({
            'messageSender':senderId,
            'kind': req.body.kind,
            'content': req.body.content,
        });

        let contact = new Contact (
            {
                'sender': senderId,
                'receiver': req.params.id,
                'messageList': [message]
            }
        );

        User.getToken(senderId)
            .then(()=> {
                contact.save()
                    .then(()=>{
                        User.decreaseToken(senderId)
                            .then(()=>{
                                return res.sendStatus(201);
                            })
                    })
                    .catch(error => { //An error occurred
                        return res.status(400).json(errorParse.parseContactError(error));
                    });
            })
            .catch(error => { //An error occurred
                return res.status(400).json(error);
            })
    });

module.exports = router;

