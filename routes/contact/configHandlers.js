'use strict';

const validation = require('../../controller/validation/validation');
const auth = require('../../controller/authentication/authentication');

exports.generalAuth = [
    auth.passport.authenticate('bearer')
];
