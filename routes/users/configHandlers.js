'use strict';

const validation = require('../../controller/validation/validation');
const auth = require('../../controller/authentication/authentication');

exports.checkSignupMentor = [
    validation.check('name'),
    validation.check('surname'),
    validation.check('email').isEmail(),
    validation.check('password').isLength({min: 8}),
    validation.check('referralCompany'),
    validation.bodyValidated
];

exports.checkSignupMentee = [
    validation.check('name'),
    validation.check('surname'),
    validation.check('email').isEmail(),
    validation.check('password').isLength({min: 8}),
    validation.bodyValidated
];


exports.minimalProfile = [
    auth.passport.authenticate('bearer')
];