'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../../models/user').User;
const Mentee = require('../../models/user').Mentee;
const Mentor = require('../../models/user').Mentor;
const Work = require('../../models/experience').Work;
const Education = require('../../models/experience').Education;
const AccessToken = require('../../models/user').AccessToken;
const server = require('./oauth2');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client("31233552109-i0tefje5p7pudjg58hfdj0u7462rj517.apps.googleusercontent.com");


/**
 * Strategy for validating the
 */
passport.use(
    new LocalStrategy(
        function (username, password, done) {
            //TODO check that the query works
            User.findOne({email: username}, function (err, user) {
                if (err)
                    return done(err);

                if (!user || !user.validPassword(password))
                    return done(null, false);

                return done(null, user);
            });
        }
    ));

passport.use(new BearerStrategy(
    function (accessToken, done) {
        AccessToken.findOne({token: accessToken}, function (err, token) {
            if (err) {
                return done(err);
            }
            if (!token) {
                return done(null, false);
            }

            User.findOne({_id: token.userId}, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, {message: 'Unknown user'});
                }
                if (user.kind === null) {
                    return done(null, false, {message: 'Registration Not Finished'})
                }

                let info = {scope: 'read'};
                done(null, user, info);
            });
        });
    }
));


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


/***************
 Google login
 ****************/
async function loginWithGoogle(req, res, done) {
    let token = req.query.token;
    try {
        res.locals.user = await createGoogleUser(token);
        done();
    } catch (e) {
        res.sendStatus(401);
    }
}

async function createGoogleUser(token) {
    let profile = await verifyGoogleToken(token);

    return await User.findOne({"googleId": profile.sub})
                     .then(async (user) => {
                         if (user === null) {
                             //If no user is found, we proceed in creating a new one.
                             user = new User({
                                 "email": profile.email,
                                 "password": "placeholder",
                                 "googleId": profile.sub,
                                 "name": profile.given_name,
                                 "surname": profile.family_name,
                                 "profilePicture": profile.picture,
                                 "kind": "User",
                             });
                         } else {
                             //Otherwise, if we have found a profile, we update some basic information.
                             user.name = profile.given_name;
                             user.surname = profile.family_name;
                             user.profile_picture = profile.picture;
                         }

                         await user.save();
                         return user;
                     })
                     .catch((_) => {
                         throw Error();
                     });
}

async function verifyGoogleToken(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "31233552109-i0tefje5p7pudjg58hfdj0u7462rj517.apps.googleusercontent.com",
    });
    return ticket.getPayload();
}


exports.verify = verifyGoogleToken;
exports.loginWithGoogle = loginWithGoogle;
exports.oauth2Server = server;
exports.passport = passport;