const express = require('express');
const bodyPareser = require('body-parser');
const _ = require('lodash');
const {mongoose} = require('./db/mongoose.js');
const {User,Mentor,Mentee} = require('./models/user.js');
//const {Experience, Education, Work, Project} = require('./models/experience');
const {Contact} = require('./models/contact');
const cors = require('cors');
mongoose.Promise = require('bluebird');


// Instantiating express
var app = express();


// Setting up the port to listen to (use env variable PORT)
portNum = process.env.PORT || 3000;
app.listen(portNum, function () {
    console.log("Listening on port " + portNum +" ...");
});

////////////////////////////////////////////////
////////////    MIDDLEWARE  ////////////////////

// Setting Json Middleware
app.use(express.json());
// allowing CORS
/*
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Expose-Headers", "x-auth");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    next();
});


// Setting the authentication Middleware
var authenticate = function (request, response, next) {
    //Getting the token from the header of the request
    var token = request.header('x-auth');
    // Checking token and returning the corresponding user
    User.findByToken(token).then(function (user) {
        if(!user)
            return Promise.reject();
        // Modifying the request by adding the user and the token to be later used
        request.user = user;
        request.token = token;
        next();
    }).catch(function (err) {
        response.status(401).send('NO ACCESS FOR U - NO AUTHORIZATION TOKEN');
    });
};
*/
////////////////////////////////////////////
////////////    ROUTES  ////////////////////

// Public route for registering Mentor
app.get('/find/allmentors', function (request,response) {
    console.log("Received Request all mentros form"+request.connection.remoteAddress)
    console.log(User.findAllMentors());
});

app.post('/signup/mentor', function (request, response) {
    console.log("Received Mentor registration request from " + request.connection.remoteAddress);

    // Retrieving data that we need from request (email, password...)
    var body = _.pick(request.body, ['email','password','name','surname','referralCompany','workingRole','state','linkedin','phoneNumber']);
    var mentor = new Mentor(body);

    // Save to db
    mentor.save()
    /*
    mentor.save().then(function () {
        // Generating authentication token for this user login session
        return mentor.generateAuthToken();
    }).then( function (token) {
        //Responding setting the header as the token
        response.header('x-auth', token).send(mentor);
        // NOTE do not send back the json with the token
    }).catch(function (err) {
        // Managing errors:
        errMsgs = [];
        try{
            if(!err.errors)
                throw new err;
            // Case of errors in body of request (missing keys etc...)
            for(var property in err.errors){
                errMsgs.push(err.errors[property].message);
            }
            response.status(400).send(JSON.stringify({errMsgs}));
        } catch (e) {
            // Case of DB error + other errors
            errMsgs.push('User might already be registered');
            response.status(400).send(JSON.stringify({errMsgs}));
        }

    })*/

});

// Public route for registering Mentee
app.post('/signup/mentee', function (request, response) {
    console.log("Received Mentee registration request from " + request.connection.remoteAddress);
    // Retrieving data that we need from request (email, password...)
    var body = _.pick(request.body, ['email','password','name','surname','linkedin','phoneNumber']);
    var mentee = new Mentee(body);

    // Save to db
    mentee.save().then(function () {
        // Generating authentication token for this user login session
        return mentee.generateAuthToken();
    }).then( function (token) {
        //Responding setting the header as the token
        response.header('x-auth', token).send(mentee);
        // NOTE do not send back the json with the token
    }).catch(function (err) {
        // Managing errors:
        errMsgs = [];
        try{
            if(!err.errors)
                throw new err;
            // Case of errors in body of request (missing keys etc...)
            for(var property in err.errors){
                errMsgs.push(err.errors[property].message);
            }
            response.status(400).send(JSON.stringify({errMsgs}));
        } catch (e) {
            // Case of DB error + other errors
            errMsgs.push('User might already be registered');
            response.status(400).send(JSON.stringify({errMsgs}));
        }

    })
});
// Public route for Login
app.post('/login',function (request, response) {
    // First, check if body contains all info that we need
    errMsgs = [];
    if(!request.body.email)
        errMsgs.push('Email is required');
    if(!request.body.password)
        errMsgs.push('Password is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }
    // Retrieve email and password from body
    var body = _.pick(request.body, ['email','password']);
    // Try to find user with this email and password
    User.findByCredentials(body.email, body.password).then(function (user) {
        // Generate token for this login
        user.generateAuthToken().then(function (token) {
            response.header('x-auth', token).send(user)
        });
    }).catch(function (err) {
        // If we're here, then the user was not found in the DB
        errMsgs.push('Wrong email or password');
        response.status(400).send(JSON.stringify({errMsgs}));
    });
});


// Private route for Logout (delete a token)
/*
app.delete('/logout', authenticate, function (request, response) {
    // Remember that in each authenticated route, we have the user in the request set by the middleware
    request.user.removeToken(request.token).then(function () {
        response.status(200).send('Logged out');
    }, function () {
        response.status(400).send('Could not correctly log out user (could not remove token from DB)');
    });});

// Private route to get all info about the logged user
app.get('/user', authenticate, function (request, response) {
    response.send(request.user);
});

// Public route to search for a Mentor (by COMPANY, STATE, or POSITION)
app.get('/search',function (request, response) {

    var searchCompany = "";
    var searchState = "";
    var searchPosition = "";

    // Retrieving from the URL the passed parameters
    if(request.query.company)
        searchCompany = request.query.company;
    if(request.query.state)
        searchState = request.query.state;
    if(request.query.position)
        searchPosition = request.query.position;

    // ElasticSearch query: NOTE: there is already a "query" field in the outer part of the encoded sent query object
    Mentor.search({
        bool: {
            should: [
                {
                    match: {
                        referralCompany: {
                            query: searchCompany,
                            fuzziness: "AUTO"
                        }
                    }
                },
                {
                    match: {
                        workingRole : {
                            query: searchPosition,
                            fuzziness: "AUTO"
                        }
                    }
                },
                {
                    match: {
                        state: {
                            query: searchState,
                            fuzziness: "AUTO"
                        }
                    }
                }
            ]
        }
    },function (err, results) {
        // Check if error has been generated
        if(err)
            response.status(400).send(err);
        else
        {
            // No query errors: save all ids of resulting mentors
            var idResultList = [];
            for(var i=0; i<results.hits.total; i++)
            {
                var shard = results.hits.hits[i];
                idResultList.push(shard._id);
            }
            // Querying MongoDb for the users corresponding to those ids
            User.findByIdSorted(idResultList).then(function (userList) {
                // Everything went well
                response.send(userList);
            }).catch(function (err) {
                // An error has occurred in MongoDB query
                response.status(400).send(err);
            });

        }

    });

});


// This route is used by a Mentee to send a contact request to a Mentor
app.post('/contact/request', authenticate, function (request, response) {

    // Retrieving the Mentor ID and text message from the request
    if(!request.body.receiver || !request.body.message){
        response.status(400).send("No receiver (Mentor) ID specified OR message");
        return;
    }

    // Parameter that we will need in this function
    var codeMentor = request.body.receiver;
    var requestMessage = request.body.message;
    var userMentor = null;
    var userMentee = request.user;
    var contact;
    var publicNewNumTokens = -1;


    // Check if sender is a Mentee and the receiver is a Mentor
    if(userMentee.kind !== "Mentee"){
        response.status(400).send(JSON.stringify({err:"Sender is not a Mentee"}));
        return;
    }
    User.findById(codeMentor).then(function (userMentr) {
        userMentor = userMentr;
        if(userMentor.kind !== "Mentor")
            return Promise.reject("Receiver is not a Mentor");

        // From now going on, we're sure that a Mentee is trying to contact a Mentor
        // We check if the Mentee has enough tokens to accomplish the request
        if( (userMentee.tokens_wallet - userMentor.cost_in_tokens) < 0 )
            return Promise.reject("Mentee has not enough credits");

        // First we create the contact, and then we decrement tokens. So if smth goes wrong, we have the record in contact, and we still haven't removed any token
        // Try to find the contact to check if it already exists
        return Contact.findBySenderAndReceiver(userMentee._id, userMentor._id);

    }).then(function (contact) {

        // Check if the contact between the two already exists
        if(contact!=null)
            return Promise.reject("Contact between those two already exists");

        // Now we can finally save the contact
        var newContactBody = {
            status: "pending",
            sending_mentee: userMentee._id,
            receiving_mentor: userMentor._id,
            pending_tokens: userMentor.cost_in_tokens
        };
        contact = new Contact(newContactBody);
        return contact.addMessage(userMentee._id.toString(), requestMessage);


    }).then(function () {

        // Finally, we update the number of tokens of our user
        var newTokens = userMentee.tokens_wallet - userMentor.cost_in_tokens;
        publicNewNumTokens = newTokens;
        return Mentee.updateTokensWallet(userMentee._id, newTokens);

    }).then(function (okResponse) {
        // If we're here, then everything went ok
        // Add new number of Tokens to the response
        okResponse.newNumTokens= publicNewNumTokens;
        // Sending back the response
        response.send(okResponse);

    }).catch(function (err) {
        response.status(400).send(JSON.stringify({err}));
    })

});


// Private route used by a Mentor to Refuse a pending contact request
app.get('/contact/refuse', authenticate, function (request, response) {

    // Retrieving the Request ID from the URL
    if(!request.query.cont_id){
        response.status(400).send("Missing cont_id from the URL parameters");
        return;
    }
    contactId = request.query.cont_id;

    // Check if we are a Mentor (only a Mentor can refuse a request)
    var userMentor = request.user;
    if(userMentor.kind !== "Mentor"){
        response.status(400).send("Only a mentor can refuse a connection request");
        return;
    }

    // Check if the requested contact exists
    var contactObject = null;
    Contact.findById(contactId).then(function (contact) {
        contactObject = contact;
        // Check that we are its destination
        if(contact.receiving_mentor.toString() !== userMentor._id.toString()){
            return Promise.reject("Requester is not the same Mentor as indicated in the contact");
        }
        // Check that the contact is still in Pending status (otherwise it cannot be refused)
        if(contact.status !== "pending"){
            return Promise.reject("Cannot refuse a contact that is not in Pending status");
        }
        // Updating the status of the contact
        return Contact.updateStatus(contactId, "refused");

    }).then(function () {
        // Search for the sending Mentee
        return User.findById(contactObject.sending_mentee);
    }).then(function (foundMentee) {
        // Set the new number of tokes to the Mentee
        var tokensToSet = foundMentee.tokens_wallet + contactObject.pending_tokens;
        return Mentee.updateTokensWallet(foundMentee._id, tokensToSet);
    }).then(function () {
        // If we're here, then everything when OK
        response.send("Contact request was successfully refused");

    }).catch(function (err) {
        response.status(400).send(err);
        return;
    });

});


// Private route used by a Mentor to Accept a pending contact request
app.get('/contact/accept', authenticate, function (request, response){
    // Retrieving the Request ID from the URL
    if(!request.query.cont_id){
        response.status(400).send("Missing cont_id from the URL parameters");
        return;
    }
    contactId = request.query.cont_id;

    // Check if we are a Mentor (only a Mentor can accept a request)
    var userMentor = request.user;
    if(userMentor.kind !== "Mentor"){
        response.status(400).send("Only a mentor can accept a connection request");
        return;
    }

    // Check if the requested contact exists
    var contactObject = null;
    Contact.findById(contactId).then(function (contact){
        contactObject = contact;
        // Check that we are its destination
        if(contact.receiving_mentor.toString() !== userMentor._id.toString()){
            return Promise.reject("Requester is not the same Mentor as indicated in the contact");
        }
        // Check that the contact is still in Pending status (otherwise it cannot be accepted)
        if(contact.status !== "pending"){
            return Promise.reject("Cannot accept a contact that is not in Pending status");
        }
        // Updating the status of the contact
        return Contact.updateStatus(contactId, "accepted");
    }).then(function () {
        // If we're here, then everything when OK
        response.send("Contact request was successfully accepted");
    }).catch(function (err) {
        response.status(400).send(err);
        return;
    })
});

// This route is used by to retrieve all possible chats contacts for a user
app.get('/contact/list', authenticate, function (request, response) {
    var user = request.user;
    var filledListOfContacts;
    var amIMentor;

    Contact.retrieveAllContactsForUser(user._id).then(function (listOfContacts) {
        // This is the list of contacts for the user
        filledListOfContacts = listOfContacts;
        // Now find info for all users appearind as destinatari in the various contact objects
        var allQueriesResults = [];
        // Determine if we are mentee or mentor --> implies who is the receiver
        if(user.kind==="Mentee"){
            amIMentor = false;
            listOfContacts.forEach(function (singleContactObject) {
                allQueriesResults.push(User.find({_id: singleContactObject.receiving_mentor}).limit(1));
            });
        }
        else{
            amIMentor = true;
            listOfContacts.forEach(function (singleContactObject) {
                allQueriesResults.push(User.find({_id: singleContactObject.sending_mentee}).limit(1));
            });
        }
        return Promise.all(allQueriesResults);
    }).then(function (listOfUsers) {
        // Now we build the response
        var counter = 0;
        var result = [];
        filledListOfContacts.forEach(function (contact) {
             var entry = {
                 myId: user._id,
                 otherUserId: listOfUsers[counter][0]._id,
                 contactId: contact._id.toString(),
                 lastMessage: contact.message_list[contact.message_list.length-1].text,
                 amIMentor: amIMentor,
                 contactStatus: contact.status
             };
             // As timestamp use update time if available, otherwise creation time
             if(!contact.updated_at || contact.updated_at === "")
                 entry.timestamp = contact.created_at;
             else
                 entry.timestamp = contact.updated_at;
             // Now finally compose the name to be shown in the message
             var shownName;
             if(contact.is_revealed==true)
                 shownName = listOfUsers[counter][0].name + " " + listOfUsers[counter][0].surname;
             else
                 shownName = listOfUsers[counter][0].pseudonym;
             entry.nameToShow = shownName;
             result.push(entry);
             counter++;
        });
        // Sort array according to the timestamp
        result.sort(function (b,a) {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        // Finally send back the response
        response.send(result);
    }).catch(function (err) {
        response.status(400).send(err);
    })

});

// This private route is used to add a new skill to a logged user
app.post('/mentee/skill', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.skillName)
        errMsgs.push('Skill name is required');
    if(!request.body.yearsOfExperience)
        errMsgs.push('Years of experience field is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }
    // Retrieve elements from the body and from the authentication details
    var body = _.pick(request.body, ['skillName','yearsOfExperience']);
    var userMentee = request.user;
    userMentee.addSkill(body.skillName, body.yearsOfExperience).then(function (skillList) {
        response.send(skillList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});


// This private route is used to remove a skill from a User that is logged in
app.delete('/mentee/skill', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.skillName){
        errMsgs.push('Skill name is required');
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }
    // Now try to delete that skill if it exists
    var userMentee = request.user;
    userMentee.removeSkill(request.body.skillName).then(function (skillList) {
        response.send(skillList);
    }).catch(function (err) {
        response.status(400).send(err);
    });
});


// This private route is used to add a new School Degree Experience to a User
app.post('/user/experience/schooldegree', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.fromMonth)
        errMsgs.push('Starting month is required');
    if(!request.body.fromYear)
        errMsgs.push('Starting year is required');
    if(!request.body.universityName)
        errMsgs.push('University Name is required');
    if(!request.body.degreeType)
        errMsgs.push('Degree Type field is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }

    // Getting all the body fields that we need
    var fromMonth = request.body.fromMonth;
    var fromYear = request.body.fromYear;
    var toMonth = 1;
    if(request.body.toMonth)
        toMonth = request.body.toMonth;
    var toYear = 1;
    if(request.body.toYear)
        toYear = request.body.toYear;
    var nowDoing = false;
    if(request.body.nowDoing)
        nowDoing = request.body.nowDoing;
    var universityName = request.body.universityName;
    var degreeType = request.body.degreeType;
    var mark = "";
    if(request.body.mark)
        mark = request.body.mark;

    // Saving the new experience to the user
    var schoolExp = new Education({fromMonth,fromYear,toMonth,toYear,nowDoing,universityName,degreeType,mark});
    var user = request.user;

    user.addSchoolExperience(schoolExp).then(function (experienceList) {
        response.send(experienceList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});

// Private route to delete a school experience
app.delete('/user/experience/schooldegree', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.experienceId){
        errMsgs.push('Experience ID is required');
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }
    // Now try to delete that experience if it exists
    var user = request.user;
    user.removeSchoolExperience(request.body.experienceId).then(function (schoolExpList) {
        response.send(schoolExpList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});

// This private route is used to add a new Work Experience to a User
app.post('/user/experience/work', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.fromMonth)
        errMsgs.push('Starting month is required');
    if(!request.body.fromYear)
        errMsgs.push('Starting year is required');
    if(!request.body.companyName)
        errMsgs.push('Company Name is required');
    if(!request.body.role)
        errMsgs.push('Role Type field is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }

    // Getting all the body fields that we need
    var fromMonth = request.body.fromMonth;
    var fromYear = request.body.fromYear;
    var toMonth = 1;
    if(request.body.toMonth)
        toMonth = request.body.toMonth;
    var toYear = 1;
    if(request.body.toYear)
        toYear = request.body.toYear;
    var nowDoing = false;
    if(request.body.nowDoing)
        nowDoing = request.body.nowDoing;
    var companyName = request.body.companyName;
    var role = request.body.role;
    var description = "";
    if(request.body.description)
        description = request.body.description;

    // Saving the new experience to the user
    var workExp = new Work({fromMonth,fromYear,toMonth,toYear,nowDoing,companyName,role,description});
    var user = request.user;

    user.addWorkExperience(workExp).then(function (experienceList) {
        response.send(experienceList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});

// Private route to delete a work experience
app.delete('/user/experience/work', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.experienceId){
        errMsgs.push('Experience ID is required');
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }
    // Now try to delete that experience if it exists
    var user = request.user;
    user.removeWorkExperience(request.body.experienceId).then(function (workExpList) {
        response.send(workExpList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});


// This private route is used to add a new Project Experience to a User
app.post('/user/experience/project', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.fromMonth)
        errMsgs.push('Starting month is required');
    if(!request.body.fromYear)
        errMsgs.push('Starting year is required');
    if(!request.body.projectTitle)
        errMsgs.push('Project Title is required');
    if(!request.body.description)
        errMsgs.push('Description field is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }

    // Getting all the body fields that we need
    var fromMonth = request.body.fromMonth;
    var fromYear = request.body.fromYear;
    var toMonth = 1;
    if(request.body.toMonth)
        toMonth = request.body.toMonth;
    var toYear = 1;
    if(request.body.toYear)
        toYear = request.body.toYear;
    var nowDoing = false;
    if(request.body.nowDoing)
        nowDoing = request.body.nowDoing;
    var projectTitle = request.body.projectTitle;
    var description = request.body.description;
    var link = "";
    if(request.body.link)
        link = request.body.link;

    // Saving the new experience to the user
    var projectExp = new Project({fromMonth,fromYear,toMonth,toYear,nowDoing,projectTitle,description,link});
    var user = request.user;

    user.addProjectExperience(projectExp).then(function (experienceList) {
        response.send(experienceList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});

// Private route to delete a project experience
app.delete('/user/experience/project', authenticate, function (request, response) {
    errMsgs = [];
    // Check for presence of all fields
    if(!request.body.experienceId){
        errMsgs.push('Experience ID is required');
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }
    // Now try to delete that experience if it exists
    var user = request.user;
    user.removeProjectExperience(request.body.experienceId).then(function (projectExpList) {
        response.send(projectExpList);
    }).catch(function (err) {
        response.status(400).send(err);
    })
});

// Private method to set the confirmed university for a user
app.post('/mentee/confirmed_university', authenticate, function (request, response) {
    var user = request.user;
    var errMsgs = [];
    // Check for presence of all fields
    if(!request.body.confirmedUniName)
        errMsgs.push('Confirmed University Name is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }

    var confirmedUniversity = request.body.confirmedUniName;
    //TODO check that inserted university is part of a predefined list

    // Set in the DB the new confirmed University for the mentee
    Mentee.setConfirmedUniversity(user._id, confirmedUniversity).then(function (result) {
        response.send(result);
    }).catch(function (err) {
        response.status(400).send(err);
    })

});

// Private method to set the residency state for a user
app.post('/user/location', authenticate, function (request, response) {
    var user = request.user;
    var errMsgs = [];
    // Check for presence of all fields
    if(!request.body.residencyState)
        errMsgs.push('Residency State is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }

    var residencyState = request.body.residencyState;
    //TODO check that inserted state is part of a predefined list

    // Set in the DB the new residency state
    User.setResidencyState(user._id, residencyState).then(function (result) {
        response.send(result);
    }).catch(function (err) {
        response.status(400).send(err);
    })

});

// Private route to add a submission to a Project Challenge
app.post('/challenge/project', authenticate, function (request, response) {
    var errMsgs = [];
    // Check for presence of all fields
    if(!request.body.projectChallengeId)
        errMsgs.push('Project Challenge Id is required');
    if(!request.body.gitHubLink)
        errMsgs.push('Github link is required');
    if(!request.body.description)
        errMsgs.push('Project description is required');
    if(errMsgs.length !== 0){
        response.status(400).send(JSON.stringify({errMsgs}));
        return;
    }

    // Getting all the body fields that we need
    var projectChallengeId = request.body.projectChallengeId;
    var gitHubLink = request.body.gitHubLink;
    var description = request.body.description;
    var submissionDate = new Date();
    var projectTitle = "My Project";
    if(request.body.projectTitle)
        projectTitle = request.body.projectTitle;
    // Now retrieving remaining data
    var authorId = request.user._id;
    var nameToDisplay = request.user.name + " " + request.user.surname;
    var myUniversity = "-";
    if(request.user.confirmed_university)        // If the user has a confirmed university, use it
        myUniversity = request.user.confirmed_university;
    var myState = "-";
    if(request.user.location)
        myState = request.user.location;


    // Now, check that that challenge actually exists and we are in a valid time range for it (not expired)
    projectChallenge.checkChallengeAvailabilityForEntry(projectChallengeId, submissionDate).then(function (foundChallenge) {
        // Then, check that we didn't do another submission for this same challenge

        var newChallengeEntry = new projectSubmission({
            author: authorId,
            gitHubLink: gitHubLink,
            description: description,
            submissionDate: submissionDate,
            nameToDisplay: nameToDisplay,
            projectTitle: projectTitle,
            myUniversity: myUniversity,
            myState: myState
        });
        return foundChallenge.addChallengeEntry(newChallengeEntry)
    }).then(function (addedSubmission) {
        // If we're here, then everything went ok
        response.send(addedSubmission);
    }).catch(function (err) {
        response.status(400).send(JSON.stringify({err}));
    })

});



// Route to retrieve a Leaderboard of a specific Category for a specific Challenge
app.get('/challenge/leaderboard', function (request, response) {

    // Retrieving the Request ID from the URL
    if(!request.query.challenge_id){
        response.status(400).send("Missing challenge_id from the URL parameters");
        return;
    }
    if(!request.query.challenge_leaderboard_type){
        response.status(400).send("Missing challenge_leaderboard_type from the URL parameters");
        return;
    }
    var challengeId = request.query.challenge_id;
    var leaderboardType = request.query.challenge_leaderboard_type;

    // Check if the leaderboard type is accepted
    if(leaderboardType!=="general" && leaderboardType!=="university" && leaderboardType!=="state"){
        response.status(400).send("The inserted leaderboard type is not accepted");
        return;
    }

    // Try to find that specific challenge from the DB
    projectChallenge.retrieveFullChallengeInfo(challengeId).then(function (foundChallenge) {
        // Now simply sort the leaderboard according to the chosen criteria
        foundChallenge = foundChallenge.toObject();
        var submissionList = foundChallenge.submissions;
        // Now do different operations according to the request type of leaderboard
        if(leaderboardType==="general"){
            // In this case, simply sort all entries
            submissionList.sort(function (a, b) {
                if(a.numLikes < b.numLikes) return 1;
                if(a.numLikes > b.numLikes) return -1;
                return 0;
            });
            // Compose return object
            foundChallenge.submissions = submissionList;
        }
        else if(leaderboardType==="university"){
            // Group by universities
            var uniLeaderboard = {};        // Uni Name : Num votes
            submissionList.forEach(function (submissionEntry) {
                if(!uniLeaderboard[submissionEntry.myUniversity])
                    uniLeaderboard[submissionEntry.myUniversity] = submissionEntry.numLikes;
                else
                    uniLeaderboard[submissionEntry.myUniversity] += submissionEntry.numLikes;
            });
            var sortedUniversities = sortProperties(uniLeaderboard);
            // Compose return object
            foundChallenge.submissions = sortedUniversities;
        }
        else {
            // Group by states
            var statesLeaderboard = {};     // State name : Num votes
            submissionList.forEach(function (submissionEntry) {
                if(!statesLeaderboard[submissionEntry.myState])
                    statesLeaderboard[submissionEntry.myState] = submissionEntry.numLikes;
                else
                    statesLeaderboard[submissionEntry.myState] += submissionEntry.numLikes;
            });
            var sortedStates = sortProperties(statesLeaderboard);
            // Compose return object
            foundChallenge.submissions = sortedStates;
        }
        // Sending back the response
        response.send(foundChallenge);
    }).catch(function (err) {
        response.status(400).send(err);
    });


});


///////////////////////////////////////////////////////
///////////////// FUNCTIONS ///////////////////////////

function sortProperties(obj)
{
    // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]

    // sort items by value
    sortable.sort(function(a, b)
    {
        return b[1]-a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

*/