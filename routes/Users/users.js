'use strict';

let express = require('express');
let router = express.Router();
const config = require('./configHandlers');
const lodash = require('lodash');
const errorParse = require('../../controller/error_parser');
//

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
                res.status(200).json(profileResponse == null ? {} : profileResponse.toObject())
            )
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
                results = await Mentor.aggregate([{$sample: {size: 7}}]);
                break;
            case "Mentor":
                results = await Mentee.aggregate([{$sample: {size: 5}}]);
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
    })
;

module.exports = router;

