'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');
const lodash = require('lodash');
const errorParse = require('../../controller/error_parser');
let ObjectId = require('mongoose').Types.ObjectId;

const {ContactMentor} = require("../../models/contact");
const {User, Mentor, Mentee} = require('../../models/user.js');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');

//-------------------
//  Registration
//-------------------


router.post("/signup/mentor",
    config.checkSignupMentor,
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname', 'referralCompany']);
        let mentor = new Mentor(req.body);

        mentor.save()
              .then(() => { //if user not present in the Database, we add it
                  return res.sendStatus(201);
              })
              .catch(error => { //Otherwise, we proceed in sending what went wrong.
                  return res.status(400).json(errorParse.parseRegistrationError(error));
              });
    });

router.post("/signup/mentee",
    config.checkSignupMentee,
    function (req, res) {
        req.body = lodash.pick(req.body, ['email', 'password', 'name', 'surname']);
        let mentee = new Mentee(req.body);

        mentee.save()
              .then(() => { //if user not present in the Database, we add it
                  return res.sendStatus(201);
              })
              .catch(error => { //Otherwise, we proceed in sending what went wrong.
                  return res.status(400).json(errorParse.parseRegistrationError(error));
              });
    }
);

router.post("/signup/decide",
    config.checkSignupDecide,
    async function (req, res) {
        let kind = req.body.kind;

        if (req.user.kind === "User" && ["Mentor", "Mentee"].includes(kind)) {
            req.user.kind = kind;
            await req.user.save();
            return res.sendStatus(200);
        }

        return res.sendStatus(400);
    }
);

//---------------------
//  Profile Information
//---------------------
router.get("/minimalprofile",
    config.generalAuth,
    function (req, res) {
        return res.status(200).json(req.user.minimalProfile());
    });

router.get("/profile",
    config.generalAuth,
    function (req, res) {
        return res.json(req.user.toObject());
    });

router.get("/profile/:id",
    config.generalAuth,
    function (req, res) {
        User.findById(req.params.id)
            .then((profileResponse) =>
                res.status(200).json(profileResponse == null ? {} : profileResponse.toObject()))
            .catch((error) => res.status(400).json(error))
    });

router.patch("/profile",
    config.generalAuth,
    async function (req, res) {
        if (req.body.kind !== undefined ||
            req.body.email !== undefined ||
            req.body._id !== undefined) {
            return res.sendStatus(400);
        }

        await User.findOneAndUpdate(
            {email: req.user.email},
            req.body,
            {new: true, runValidators: true}
        ).then(() => res.sendStatus(200)
        ).catch((e) =>
            res.sendStatus(400)
        );
    }
);


router.get("/explore",
    config.generalAuth,
    async function (req, res) {
        let results;

        switch (req.user.kind) {
            case "Mentee":
                let contactedMentorsId = await ContactMentor.find({"menteeId": req.user._id})
                                                            .then((list) => list.map((e) => ObjectId(e.mentorId)));
                results = await Mentor.aggregate([
                    {"$match": {"_id": {"$nin": contactedMentorsId}}},
                    {$sample: {size: 7}}
                ]);
                break;
            case "Mentor":
                let contactedMenteesId = await ContactMentor.find({"mentorId": req.user._id})
                                                            .then((list) => list.map((e) => ObjectId(e.menteeId)));
                results = await Mentee.aggregate([
                    {"$match": {"_id": {"$in": contactedMenteesId}}},
                    {$sample: {size: 7}}
                ]);
                break;
            default:
                return res.sendStatus(400);
        }

        results.forEach(function (part, index) {
            part.pastExperiences = [...part.educationList, ...part.experienceList];
            delete part.educationList;
            delete part.experienceList;
            this[index] = part;
        }, results);

        return res.status(200).json(results);
    });


router.post(
    "/sendrequest/:mentorid",
    config.generalAuth,
    async function (req, res) {
        if (req.body === undefined || req.body.answers === undefined || req.body.startingMessage === undefined) {
            return res.status(400).json({"message": "No body."});
        }

        if (req.user.kind !== "Mentee") {
            return res.status(400).json({"message": "A mentor cannot contact another mentor."});
        }

        let mentor = await User.findById(req.params.mentorid);
        let contact = await ContactMentor.findOne({
            "mentorId": req.params.mentorid,
            "menteeId": req.user._id,
        });

        if (mentor == null) {
            return res.status(400).json({"message": "No mentor"});
        }

        if (contact != null) {
            return res.status(400).json({"message": "Already contacted."});
        }


        mentor = mentor.toObject();
        let answers = [];
        for (let i = 0; i < mentor.questionsForAcceptingRequest.length; i++) {

            if (req.body.answers === undefined || req.body.answers[i] === undefined ||
                (req.body.answers[i].textAnswer === undefined && req.body.answers[i].audioAnswer === undefined)) {
                return res.status(400).json({"message": "No answers."});
            }

            answers.push(
                {
                    "question": mentor.questionsForAcceptingRequest[i].question,
                    "textAnswer": req.body.answers[i].textAnswer ? req.body.answers[i].textAnswer : "",
                    "audioAnswer": req.body.answers[i].audioAnswer ? req.body.answers[i].audioAnswer : "",
                }
            );
        }

        let aq = ContactMentor({
            "menteeId": req.user._id,
            "mentorId": req.params.mentorid,
            "startingMessage": req.body.startingMessage,
            "answers": answers,
        });
        await aq.save();
        return res.sendStatus(200);
    });

router.post(
    "/deciderequest/:idrequest",
    config.generalAuth,
    async function (req, res) {
        if (req.body === undefined) {
            return res.status(400).json({"message": "No body."});
        }

        if (!["accepted", "refused"].includes(req.body.status)) {
            return res.status(400).json({"message": "Incorrect status."});
        }

        if (req.user.kind === "Mentee") {
            return res.status(400).json({"message": "What are you doing here?!"});
        }

        let request = await ContactMentor.findById(req.params.idrequest)
                                         .catch(_ => null);

        if (request == null) {
            return res.status(400).json({"message": "No request found."});
        }

        if (request.status !== "pending") {
            return res.status(400).json({"message": "Can't change what's have been decided."});
        }


        if (!ObjectId(request.mentorId).equals(req.user.toObject()._id)) {
            return res.status(400).json({"message": "Can't decide other's fate."});
        }

        request.status = req.body.status;
        await request.save();
        return res.sendStatus(200);
    });

router.get("/contactrequest",
    config.generalAuth,
    async function (req, res) {
        let results;
        switch (req.user.kind) {
            case "Mentee":
                results = await ContactMentor
                    .find({"menteeId": req.user._id})
                    .then(async (list) => await Promise.all(list.map(async function (e) {
                            e = e.toObject();
                            e.user = await Mentor.findById(e.mentorId).then((e) => e.minimalProfile());
                            delete e.mentorId;
                            e.messages = e.messages[0] === undefined ? [] : [e.messages[0]];
                            return e;
                        }
                    )));
                break;
            case "Mentor":
                results = await ContactMentor
                    .find({"mentorId": req.user._id})
                    .then(async (list) => await Promise.all(list.map(async function (e) {
                            e = e.toObject();
                            e.user = await Mentee.findById(e.menteeId).then((e) => e.minimalProfile());
                            delete e.menteeId;
                            e.messages = e.messages[0] === undefined ? [] : [e.messages[0]];
                            return e;
                        }
                    )));
                break;
            default:
                return res.sendStatus(400);
        }

        return res.status(200).json(results);
    });

router.get("/contactrequest/:idrequest",
    config.generalAuth,
    async function (req, res) {
        let result = await ContactMentor.findById(req.params.idrequest)
                                        .then(e => e.toObject())
                                        .catch(e => null);

        return result !== null ? res.status(200).json(result) : res.sendStatus(400);
    });

module.exports = router;

