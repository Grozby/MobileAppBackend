const mongoose = require('mongoose');
require('mongoose-type-url');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mentor = require('./mentor');
const mentee = require('./mentee');
const enums = require('./enums');
const experience = require('./experience');

//const Constants = require('./../../utilities/constants');
var ObjectId = require('mongoose').Types.ObjectId;

/////////////// SECRET SALT ADDED TO THE JST TOKEN SIGNATURE //////////////
//const secret = Constants.authenticationTokenSecret;

var options = {discriminatorKey: 'kind'};

// Defining the mongoose schema
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            // Returns either true (valid) or false (invalid)
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
    tokens: [{      // Array composed of elements (access,token)
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
    bio: {
        type: String,
        min: 1,
        max: 1000,
        trim: true,
        default: `Hi I'm excited to be here!`
    },
    profile_picture: {
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

    phoneNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return /\d{3}-\d{3}-\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },

    educationList: {
        type: [experience.Education.schema]
    },
    experienceList: {
        type: [experience.Work.schema]
    },
    questionList:{
        type: [enums.questionSchema]
    },
    tagList:{
        type: [enums.tagSchema]
    }
    // notification
},options);

// Schema method to find an User starting from its token
UserSchema.statics.exploreSection = function(){
    return User.find({kind:'Mentor'},{ email:0,password:0,pseudonym:0,tokens:0,cost_in_tokens:0});
};

UserSchema.statics.getProfile = function(id){
    return User.find({_id:id},{ email:0,password:0,pseudonym:0,tokens:0,cost_in_tokens:0});
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    // We need a try catch block because if token is not valid, jwt launches an error
    try{
        decoded = jwt.verify(token, secret);
    } catch(err){
        return Promise.reject();
    }
    // Quering the DB and returning the user
    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};


// Schema method to find an user using its email and password
UserSchema.statics.findByCredentials = function(email, password){
    var User = this;
    // Query db for that email
    return User.findOne({email}).then(function (user) {
        // If user does not exists...
        if (!user){
            return Promise.reject();
        }
        // Otherwise, if it exists, compare crypted password
        return new Promise(function (resolve, reject) {
            bcrypt.compare(password, user.password, function (error, res) {
                if(res)
                    resolve(user);
                else
                    reject();
            });
        });
    });
};

// Schema method to find a single user, given its id
UserSchema.statics.findById = function(userId) {
    return User.findOne({
        _id: userId
    }).then(function (foundUser) {
        return new Promise(function (resolve, reject) {
            if(!foundUser)
                reject("User was not found by ID");
            else
                resolve(foundUser);
        });
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Schema method to find a single user, given its id
UserSchema.statics.findByIdCustom = function(userId) {
    return User.find({
        _id: userId
    }).limit(1).then(function (foundUser) {
            if(!foundUser)
                return Promise.reject("User was not found by ID");
            else
                return Promise.resolve(foundUser);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Schema method to find a list of users starting from their _id
UserSchema.statics.findByIdSorted = function(idList){
    // Query Mongo for those ids
    return User.find({
        '_id': { $in : idList}
    }).then(function (userList) {
        // If no results were returned by Mongo
        if(!userList)
            return Promise.reject();
        // Otherwise, return sorted result according to Elastic
        return new Promise(function (resolve, reject) {
            resultArray = [];
            idList.forEach(function (id) {      // For each id returned by Elastic, find its corresponding into the Mongo result objects
                userList.forEach(function (user) {
                    if(user._doc._id == id)
                        resultArray.push(user);
                })
            });
            if(resultArray.length > 0)
                resolve(resultArray);
            else
                reject();
        });
    });
};


// Schema method to update the number of tokens for a specific mentee
mentee.menteeSchema.statics.updateTokensWallet = function(menteeId, numTokens){
    menteeId = menteeId.toString();
    return Mentee.updateOne({_id: menteeId}, {
        tokens_wallet: numTokens
    }).then(function (user) {
        return Promise.resolve(user);
    }).catch(function (err) {
        return Promise.reject(err);
    })
};

// Method to set the name of the confirmed University for a Mentee
mentee.menteeSchema.statics.setConfirmedUniversity = function(menteeId, confirmedUniName){
    menteeId = menteeId.toString();
    return Mentee.updateOne({_id: menteeId}, {
        confirmed_university: confirmedUniName
    }).then(function (user) {
        return Promise.resolve(user);
    }).catch(function (err) {
        return Promise.reject(err);
    })
};

// Method to set the residency state for a user
UserSchema.statics.setResidencyState = function(userId, residencyState){
    userId = userId.toString();
    return User.updateOne({_id: userId}, {
        location: residencyState
    }).then(function (user) {
        return Promise.resolve(user);
    }).catch(function (err) {
        return Promise.reject(err);
    })
};


// Another method to remove a token
UserSchema.methods.removeToken = function(token){
    var user = this;

    // Update using the MongoDB $pull (remove) operator
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

// Run code before firing events (Middleware)!!!
UserSchema.pre('save',function (next) {
    var user = this;

    // Call this function when the password field is modified
    if(user.isModified('password'))
    {
        // Overwrite plain password with hashed password
        bcrypt.genSalt(10,function (error, salt) {
            bcrypt.hash(user.password, salt, function (error, hash) {
                user.password = hash;
                next(); // Move on and save()
            });
        });
    }else
    {
        next();
    }
});


// Instance method to get the list of skills for the user
UserSchema.methods.getSkills = function(){
    var user = this;
    // Return the list of skills for this user
    return user.skillList;
};


// Instance method to add a Skill for a user
UserSchema.methods.addSkill = function(skillName, yearsOfExperience){
    var user = this;
    //First, check if the user already has this skill
    var duplicated = false;
    user.skillList.forEach(function (element) {
        if(element.skillName === skillName)
            duplicated = true;
    });
    if(duplicated===true)
        return Promise.reject("This skill already exists for this user");
    // Saving the new skill for the user
    user.skillList = user.skillList.concat({skillName, yearsOfExperience});
    // Save with promise
    return user.save().then(function () {
        return Promise.resolve(user.skillList);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Instance method to delete a skill from a User
UserSchema.method('removeSkill', function(skillName){
    var user = this;
    // Check if this skill exists for this user
    var found = false;
    var counter = 0, index=0;
    user.skillList.forEach(function (element) {
        if(element.skillName === skillName){
            found = true;
            index = counter;
        }
        counter++;
    });
    if(found===false)
        return Promise.reject("Cannot delete a skill that is not registered for this user");
    // Delete the skill
    user.skillList = user.skillList.filter(function (value, index, arr) {
        return value.skillName!==skillName;
    });
    // Finally save the user
    return user.save().then(function () {
        return Promise.resolve(user.skillList);
    }).catch(function (err) {
        return Promise.reject(err);
    });
});


// Instance method for generating an access Token
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    // Creating a new token
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, secret);
    // Saving the token
    user.tokens = user.tokens.concat({access, token});
    // Save with promise
    return user.save().then(function () {
        return Promise.resolve(token);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Instance method for adding a new experience
UserSchema.methods.addSchoolExperience = function (experience) {
    var user = this;
    // Saving the new experience for the user
    user.experienceSchoolList = user.experienceSchoolList.concat(experience);
    // Save with promise
    return user.save().then(function () {
        return Promise.resolve(user.experienceSchoolList);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Instance method for removing an experience
UserSchema.methods.removeSchoolExperience = function (experienceId) {
    var user = this;
    // Delete the experience
    var found = false;
    user.experienceSchoolList = user.experienceSchoolList.filter(function (value, index, arr) {
        if(value._id==experienceId)
            found=true;
        return value._id!=experienceId;
    });
    if(found===false)
        return Promise.reject("Trying to remove a non-existent school experience");
    // Save with promise
    return user.save().then(function () {
        return Promise.resolve(user.experienceSchoolList);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Instance method for adding a new experience
UserSchema.methods.addWorkExperience = function (experience) {
    var user = this;
    // Saving the new experience for the user
    user.experienceWorkList = user.experienceWorkList.concat(experience);
    // Save with promise
    return user.save().then(function () {
        return Promise.resolve(user.experienceWorkList);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Instance method for removing an experience
UserSchema.methods.removeWorkExperience = function (experienceId) {
    var user = this;
    // Delete the experience
    var found = false;
    user.experienceWorkList = user.experienceWorkList.filter(function (value, index, arr) {
        if(value._id==experienceId)
            found=true;
        return value._id!=experienceId;
    });
    if(found===false)
        return Promise.reject("Trying to remove a non-existent work experience");
    // Save with promise
    return user.save().then(function () {
        return Promise.resolve(user.experienceWorkList);
    }).catch(function (err) {
        return Promise.reject(err);
    });
};

// Defining the user model
var User = mongoose.model('User',UserSchema);
var Mentor = User.discriminator('Mentor',mentor.mentorSchema);
var Mentee = User.discriminator('Mentee',mentee.menteeSchema);

// Exporting
module.exports = {
    User,
    UserSchema,
    Mentor,
    Mentee
};
