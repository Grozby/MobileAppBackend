let mongoose = require('mongoose');
const {Mentor} = require("../models/user");


mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://159.89.15.169:27017/mobileapp', {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE,
    autoReconnect: true
}).then(
    async () => {
        console.log('Database is connected');
        await initializeDatabase();
    },
    err => {
        console.log('Can not connect to the database' + err);
    }
);

async function initializeDatabase () {
    let dummyMentorData = [
            {
                kind: "Mentor",
                email: "bobberoneross@google.com",
                password: "placeholder",
                name: "Bob",
                surname: "Ross",
                bio:
                    "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                location: "Mountain View, US",
                company: "Google",
                pictureUrl:
                    "https://images.csmonitor.com/csm/2015/06/913184_1_0610-larry_standard.jpg?alias=standard_900x600",
                currentJob: {
                    kind: "Job",
                    institution: {
                        name: "Google",
                        pictureUrl:
                            "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",
                    },
                    workingRole: "Software Engineer",
                    fromDate: "2019-03-01 00:00:00.000Z",
                },
                questions: [
                    {
                        question: "What are your favourite programming languages?",
                        answer: "Java, Python, C++",
                    },
                    {
                        question: "What inspires you the most in your work?",
                        answer: "E dove trovarli",
                    }
                ],
                educationList: [
                    {
                        kind: "Education",
                        institution: {
                            name: "Stanford University",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    },
                    {
                        kind: "Education",
                        institution: {
                            name: "Politecnico di Milano",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    },
                    {
                        kind: "Education",
                        institution: {
                            name: "Politecnico di Milano",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    }
                ],
                experienceList:
                    [
                        {
                            kind: "Job",
                            institution: {
                                name: "Apple",
                                pictureUrl:
                                    "https://i.pinimg.com/originals/1c/aa/03/1caa032c47f63d50902b9d34492e1303.jpg",
                            },
                            workingRole: "Software Engineer",
                            fromDate: "2019-03-01 00:00:00.000Z",
                            toDate: "2019-09-01 00:00:00.000Z",
                        }
                    ],
                socialAccounts: [],
                questionsForAcceptingRequest: [
                    {
                        question: "In Software Engineering, briefly explain what the patter Wrapper is used for?",
                        availableTime: 10,
                    },
                    {
                        question: "Ma sei megaminchia?",
                        availableTime: 60,
                    }
                ],
                workingSpecialization:
                    ["Software Engineer", "Python", "Machine Learning"],
            },
            {
                kind: "Mentor",
                email: "bobberoneross2@google.com",
                password: "placeholder",
                name: "Bobberino",
                surname: "Ross",
                bio:
                    "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                location: "Mountain View, US",
                company: "Google",
                pictureUrl:
                    "https://b.thumbs.redditmedia.com/7Zlnm0CUqYG2VIdqpc8QA08cvoINPKTvOZDL2kjfmsI.png",
                currentJob: {
                    kind: "Job",
                    institution: {
                        name: "Google",
                        pictureUrl:
                            "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",
                    },
                    workingRole: "Software Engineer",
                    fromDate: "2019-03-01 00:00:00.000Z",
                },
                question: [
                    {
                        question: "What are your favourite programming languages?",
                        answer: "Java, Python, C++",
                    },
                    {
                        question: "What inspires you the most in your work?",
                        answer: "E dove trovarli",
                    }
                ],
                educationList: [
                    {
                        kind: "Education",
                        institution: {
                            name: "Stanford University",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    },
                    {
                        kind: "Education",
                        institution: {
                            name: "Politecnico di Milano",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    }
                ],
                experienceList:
                    [
                        {
                            kind: "Job",
                            institution: {
                                name: "Apple",
                                pictureUrl:
                                    "https://i.pinimg.com/originals/1c/aa/03/1caa032c47f63d50902b9d34492e1303.jpg",
                            },
                            workingRole: "Software Engineer",
                            fromDate: "2019-03-01 00:00:00.000Z",
                            toDate: "2019-09-01 00:00:00.000Z",
                        }
                    ],
                socialAccounts: [],
                questionsForAcceptingRequest: [],
                workingSpecialization:
                    ["Software Engineer"],
            },
            {
                kind: "Mentor",
                email: "bobberoneross3@google.com",
                password: "placeholder",
                name: "Bob",
                surname: "Ross",
                bio:
                    "\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\"",
                location: "Mountain View, US",
                company: "Google",
                pictureUrl:
                    "https://images.csmonitor.com/csm/2015/06/913184_1_0610-larry_standard.jpg?alias=standard_900x600",
                currentJob: {
                    kind: "Job",
                    institution: {
                        name: "Google",
                        pictureUrl:
                            "https://freeiconshop.com/wp-content/uploads/edd/google-flat.png",
                    },
                    workingRole: "Software Engineer",
                    fromDate: "2019-03-01 00:00:00.000Z",
                },
                question: [
                    {
                        question: "What are your favourite programming languages?",
                        answer: "Java, Python, C++",
                    },
                    {
                        question: "What inspires you the most in your work?",
                        answer: "E dove trovarli",
                    }
                ],
                educationList: [
                    {
                        kind: "Education",
                        institution: {
                            name: "Stanford University",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    },
                    {
                        kind: "Education",
                        institution: {
                            name: "Politecnico di Milano",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    },
                    {
                        kind: "Education",
                        institution: {
                            name: "Politecnico di Milano",
                            pictureUrl:
                                "https://identity.stanford.edu/img/block-s-2color.png",
                        },
                        degreeLevel: "Ph.D",
                        fieldOfStudy: "Computer Science",
                        fromDate: "2015-07-01 00:00:00.000Z",
                        toDate: "2018-07-01 00:00:00.000Z",
                    }
                ],
                experienceList:
                    [
                        {
                            kind: "Job",
                            institution: {
                                name: "Apple",
                                pictureUrl:
                                    "https://i.pinimg.com/originals/1c/aa/03/1caa032c47f63d50902b9d34492e1303.jpg",
                            },
                            workingRole: "Software Engineer",
                            fromDate: "2019-03-01 00:00:00.000Z",
                            toDate: "2019-09-01 00:00:00.000Z",
                        }
                    ],
                socialAccounts: [],
                questionsForAcceptingRequest: [],
                workingSpecialization:
                    ["Software Engineer", "Full-Stack", "Back-End"],
            },

        ];

    dummyMentorData.forEach(function(mentorData) {
        Mentor.exists({email: mentorData.email})
              .then(async (doesExist) => {
                  if (!doesExist) {
                      let mentor = new Mentor(mentorData);
                      await mentor.save();
                  }
              })
              .catch((_) => {
                  console.log("pezzii");
              });
    });

}

module.exports = {
    mongoose
};

