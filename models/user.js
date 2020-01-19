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
        type: String,
        default: 'US'
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
        type: experience.Work.schema,
        required: true,
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
                'Mobile Dev.'],
        }]
    },
    questionsForAcceptingRequest: {
        type: [contactOption.questionsForAcceptingRequestSchema]
    }

    // notification
}, options);

UserSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

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


UserSchema.statics.getQuiz = function (id) {
    return User.findOne({_id: id}, {'contactOpt.question': 1, 'contactOpt.timeInMinutes': 1});
};

UserSchema.statics.getContactInfo = function (id) {
    return User.findOne({_id: id}, {
        'contactOpt.kind': 1,
        'contactOpt.timeInMinutes': 1,
        name: 1,
        surname: 1,
        referralCompany: 1,
        profilePicture: 1,
        location: 1,
        workingRole: 1
    });
};

// Schema method to find an User starting from its token
UserSchema.statics.exploreSection = function () {
    return User.find({kind: 'Mentor'}, {
        email: 0,
        password: 0,
        pseudonym: 0,
        tokens: 0,
        cost_in_tokens: 0,
        contactOpt: 0
    });
};


// Run code before firing events (Middleware)!!!
UserSchema.pre('save', function (next) {
    var user = this;

    // Call this function when the password field is modified
    if (user.isModified('password')) {
        // Overwrite plain password with hashed password
        bcrypt.genSalt(10, function (error, salt) {
            bcrypt.hash(user.password, salt, function (error, hash) {
                user.password = hash;
                next(); // Move on and save()
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
