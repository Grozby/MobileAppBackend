'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../models/user').User;
const Mentee = require('../../models/user').Mentee;
const AccessToken = require('../../models/user').AccessToken;
const server = require('./oauth2');
const googleIdConfig = require('./client_id_google');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client("31233552109-i0tefje5p7pudjg58hfdj0u7462rj517.apps.googleusercontent.com");


/**
 * Strategy for validating the
 */
passport.use(
    new LocalStrategy(
        function (username, password, done) {
            User.findOne({email: username}, function (err, user) {
                if (err)
                    return done(err);

                //We need to check that neither one of the socialIds is present.
                if (!user || !user.validPassword(password) || user.googleId)
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

                let info = {scope: '*'};
                done(null, user, info);
            });
        });
    }
));

passport.use(new GoogleStrategy({
        clientID: googleIdConfig.web.client_id,
        clientSecret: googleIdConfig.web.client_secret,
        callbackURL: "/auth/google/callback",
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
        scope: ['openid', 'profile', 'email']
    },
    function (accessToken, refreshToken, profile, done) {
        User.find({"googleId": profile.id})
            .then((s) => {
                if (s.length === 0) {
                    let newGoogleUser = new User({
                        "email": profile.emails[0].value,
                        "password": "placeholder",
                        "googleId": profile.id,
                        "name": profile.name.givenName,
                        "surname": profile.name.familyName,
                        "profilePicture": profile.photos[0].value
                    });

                    return newGoogleUser.save()
                                        .then((user) => {
                                            done(null, user);
                                        })
                                        .catch((error) => {
                                            console.log(error);
                                            done(error);
                                            return undefined;
                                        });
                }

                done(null, s[0]);
            });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

async function loginWithGoogle(token) {
    let profile = await verify(token);

    await User.findOne({"googleId": profile.sub})
        .then(async (user) => {
            console.log(user);
            user.email = profile.email;
            user.password = "placeholder";
            user.name = profile.given_name;
            user.surname = profile.family_name;
            user.profile_picture = profile.picture;
            await user.save();
        })
        .catch((error) => {
            throw Error('eee')
        });
}

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "31233552109-i0tefje5p7pudjg58hfdj0u7462rj517.apps.googleusercontent.com",
    });
    return ticket.getPayload();
}

exports.verify = verify;
exports.loginWithGoogle = loginWithGoogle;
exports.oauth2Server = server;
exports.passport = passport;


//
// passport.use(new BasicStrategy(
//     function (messageSender, password, done) {
//         ClientModel.findOne({clientId: messageSender}, function (err, client) {
//             if (err) {
//                 return done(err);
//             }
//             if (!client) {
//                 return done(null, false);
//             }
//             if (client.clientSecret != password) {
//                 return done(null, false);
//             }
//
//             return done(null, client);
//         });
//     }
// ));
//
// passport.use(new ClientPasswordStrategy(
//     function (clientId, clientSecret, done) {
//         ClientModel.findOne({clientId: clientId}, function (err, client) {
//             if (err) {
//                 return done(err);
//             }
//             if (!client) {
//                 return done(null, false);
//             }
//             if (client.clientSecret != clientSecret) {
//                 return done(null, false);
//             }
//
//             return done(null, client);
//         });
//     }
// ));
//
