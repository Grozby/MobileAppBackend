'use strict';

const oauth2orize = require('oauth2orize');
const crypto = require('crypto');
const User = require('../../models/user').User;
const AccessToken = require('../../models/user').AccessToken;

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Exchange username & password for an access token.
server.exchange(
    oauth2orize.exchange.password(function (client, username, password, scope, done) {
        User.findOne({email: username}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user || !user.validPassword(password)) {
                return done(null, false);
            }

            AccessToken.findOne({userId: user.id}, function (err, token) {
                if (err)
                    return done(err);
                if (!token) {
                    let tokenValue = crypto.randomBytes(64).toString('hex');
                    let token = new AccessToken({token: tokenValue, userId: user.id});

                    token.save(function (err) {
                        if (err)
                            return done(err);

                        done(null, tokenValue);
                    });
                } else {
                    done(null, token.token);
                }
            });


        });
    }));

function generateToken(req, res, done) {
    let tokenValue = crypto.randomBytes(64).toString('hex');
    let userId = req.user._doc._id.toString();
    AccessToken.findOne(
        { "userId": userId},
        function (err, token) {
            if (err)
                done(err);

            if(!token)
                token = new AccessToken({"userId": userId, "token":tokenValue});
            else
                token.token = tokenValue;

            token.save(function(error, token) {
                if (err)
                    done(err);

                res.locals.token = tokenValue;
                done();
            });
        });
}

// token endpoint
exports.generateToken = generateToken;
exports.serverToken = server.token();
exports.errorHandler = server.errorHandler();
