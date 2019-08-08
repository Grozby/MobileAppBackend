'use strict';

exports.parseRegistrationError = function (error){
    if(error.code === 11000){
        return {
            "error": "EMAIL_ALREADY_USED"
        }
    }

    return error;
};