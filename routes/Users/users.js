'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');
const lodash = require('lodash');
const errorParse = require('../../controller/error_parser');
let ObjectId = require('mongoose').Types.ObjectId;

const {AnswersQuestions} = require("../../models/answer");
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
        return res.json({
            kind: req.user.kind,
            name: req.user.email,
            profilePicture: req.user.pictureUrl,
        })
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
                let contactedMentorsId = await AnswersQuestions.find({"menteeId": req.user._id})
                                                               .then((list) => list.map((e) => ObjectId(e.mentorId)));
                results = await Mentor.aggregate([
                    {"$match": {"_id": {"$nin": contactedMentorsId}}},
                    {$sample: {size: 7}}
                ]);
                break;
            case "Mentor":
                let contactedMenteesId = await AnswersQuestions.find({"mentorId": req.user._id})
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
        if (req.body === undefined) {
            return res.status(400).json({"message": "No body."});
        }

        let mentor = await User.findById(req.params.mentorid);
        let contact = await AnswersQuestions.findOne({
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

            if (req.body[i] === undefined ||
                (req.body[i].textAnswer === undefined && req.body[i].audioAnswer === undefined)) {
                return res.status(400).json({"message": "No body."});
            }

            answers.push(
                {
                    "question": mentor.questionsForAcceptingRequest[i].question,
                    "textAnswer": req.body[i].textAnswer ? req.body[i].textAnswer : "",
                    "audioAnswer": req.body[i].audioAnswer ? req.body[i].audioAnswer : "",
                }
            );
        }

        let aq = AnswersQuestions({
            "menteeId": req.user._id,
            "mentorId": req.params.mentorid,
            "answers": answers,
        });
        await aq.save();
        return res.sendStatus(200);
    });


module.exports = router;

