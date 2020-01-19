'use strict';

let express = require('express');
let router = express.Router();
const lodash = require('lodash');

const errorParse = require('../../controller/error_parser');
const {User} = require('../../models/user.js');
const {Contact,Message} = require('../../models/contact.js');
const {mongoose} = require('../../db/mongoose.js');
mongoose.Promise = require('bluebird');

module.exports = router;

