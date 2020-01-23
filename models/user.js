const mongoose = require('mongoose');
require('mongoose-type-url');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const findOrCreate = require('mongoose-findorcreate');

const mentor = require('./mentor');
const mentee = require('./mentee');
const enums = require('./enums');
const contactOption = require('./contactOption');
const experience = require('./experience');

//const Constants = require('./../../api/constants');
let ObjectId = require('mongoose').Types.ObjectId;


let options = {discriminatorKey: 'kind'};

// Defining the mongoose schema
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        minlength: 1,
        trim: true,
        required: [true, 'Your name should be at least 1 character long']
    },
    surname: {
        type: String,
        minlength: 1,
        trim: true,
        required: [true, 'Your surname should be at least 1 character long']

    },
    location: {
        type: String
    },
    googleId: {
        type: String,
        sparse: true,
    },
    bio: {
        type: String,
        min: 1,
        max: 1000,
        trim: true,
        default: `Hello. I'm excited to be here!`
    },
    pictureUrl: {
        type: mongoose.SchemaTypes.Url,
        default: "https://ui-avatars.com/api/?background=0D8ABC&color=fff"
    },
    linkedin: {
        type: mongoose.SchemaTypes.Url
    },
    facebook: {
        type: mongoose.SchemaTypes.Url
    },
    github: {
        type: mongoose.SchemaTypes.Url
    },
    instagram: {
        type: mongoose.SchemaTypes.Url
    },
    twitter: {
        type: mongoose.SchemaTypes.Url
    },
    currentJob: {
        type: experience.Work.schema
    },
    educationList: {
        type: [experience.Education.schema]
    },
    experienceList: {
        type: [experience.Work.schema]
    },
    questions: {
        type: [enums.questionSchema]
    },
    workingSpecialization: {
        type: [{
            type: String,
            enum: [
                'Software Engineer',
                'Full-Stack',
                'Front-End',
                'Back-End',
                'Machine Learning',
                'Python',
                'C++',
                'iOS',
                'Android',
                'Mobile Dev.'
            ],
        }]
    },
    questionsForAcceptingRequest: {
        type: [contactOption.questionsForAcceptingRequestSchema]
    }

    // notification
}, options);

UserSchema.options.toObject = {
    transform: function(doc, ret) {
        ret.pastExperiences = [
            ...ret.educationList,
            ...ret.experienceList
        ];
        delete ret.educationList;
        delete ret.experienceList;
        delete ret.password;

        let socialAccountList = [
            "twitter", "github", "facebook", "linkedin", "instagram"
        ];

        ret.socialAccounts = socialAccountList
            .map((e) => {
                if (ret[e] != null) {
                    return {
                        "type": e,
                        "urlAccount": ret[e]
                    }
                }
            })
            .filter(e => e != null);
        delete ret.twitter;
        delete ret.github;
        delete ret.linkedin;
        delete ret.instagram;
        delete ret.facebook;

        return ret;
    }
};

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.method('minimalProfile', function () {
    return {
        "_id": this._id,
        "name": this.name,
        "surname": this.surname,
        "pictureUrl": this.pictureUrl
    }
});

//TODO: contact options.
// https://stackoverflow.com/questions/675231/how-do-i-access-properties-of-a-javascript-object-if-i-dont-know-the-names

UserSchema.statics.getToken = function (id) {
    return new Promise((resolve, reject) => {
        User.findOne({_id: id}, function (err, user) {
            if (user.kind === 'Mentor') {
                resolve()
            }
            if (user.kind === 'Mentee') {
                if (user.tokens_wallet < 1) {
                    reject({"error": "NOT_ENOUGH_TOKENS"})
                } else {
                    resolve()
                }
            }
        });
    })
};

UserSchema.statics.decreaseToken = function (id) {
    return new Promise((resolve, reject) => {
        User.findOne({_id: id}, function (err, user) {
            if (user.kind === 'Mentor') {
                resolve()
            }
            if (user.kind === 'Mentee') {
                user.tokens_wallet = user.tokens_wallet - 1;
                user.save();
                resolve()
            }
            if (err) {
                reject(err)
            }
        });
    })
};


// If the password is updated, then we use bcrypt to hash it.
UserSchema.pre('save', function (next) {
    let user = this;
    if (user.isModified('password')) {
        // Overwrite plain password with hashed password
        bcrypt.genSalt(10, function (error, salt) {
            bcrypt.hash(user.password, salt, function (error, hash) {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});


UserSchema.pre('findOneAndUpdate', function (next) {
    let user = this._update;

    // Call this function when the password field is modified
    if (user.password !== undefined) {
        // Overwrite plain password with hashed password
        bcrypt.genSalt(10, function (error, salt) {
            bcrypt.hash(user.password, salt, function (error, hash) {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});


// AccessToken
let AccessTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    token: {
        type: String,
        unique: true,
        required: true
    }
});

let AccessToken = mongoose.model('AccessToken', AccessTokenSchema);

// Client
let ClientModel = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    clientId: {
        type: String,
        unique: true,
        required: true
    },
    clientSecret: {
        type: String,
        required: true
    }
});

let Client = mongoose.model('Client', ClientModel);

// Defining the user model
UserSchema.plugin(findOrCreate);
let User = mongoose.model('User', UserSchema);
let Mentor = User.discriminator('Mentor', mentor.mentorSchema);
let Mentee = User.discriminator('Mentee', mentee.menteeSchema);

// Exporting
module.exports = {
    User,
    AccessToken,
    Client,
    UserSchema,
    Mentor,
    Mentee
};
