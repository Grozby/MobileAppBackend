'use strict';

const {check, validationResult} = require('express-validator');

exports.check = check;

/**
 * Error function that acts after the various checks done on the body.
 * @param req
 * @param res
 * @param next
 * @returns {createServer.NextHandleFunction | * | Response | Promise<any>}
 */
exports.bodyValidated = function bodyValidated(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    next();
};