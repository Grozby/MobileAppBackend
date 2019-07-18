let express = require('express');
let router = express.Router();

let development = true;

let signupMentee = {
    name: "Flavio",
    surname: "Di Palo",
    email: "penegrosso@gmail.com",
    password: "password"
};

let signupMentor = {
    name: "Larry",
    surname: "Page",
    email: "penegrossissimo@google.com",
    password: "password",
    company: "Google"
};

let login = {
    email: "penegrosso@gmail.com",
    password: "password"
};

let explore = {

};

/* GET users listing. */
router.get('/', function (req, res, next) {
    if (development)
        res.send('respond with a resource');
});

router.get("/signup/mentee", function (req, res, next) {
    if (development)
        res.json(signupMentee);
});

router.get("/signup/mentor", function (req, res, next) {
    if (development)
        res.json(signupMentor);
});

router.post("/login", function (req, res, next) {

    body = login;
    if (development)
        //Check login
        res.json(signupMentor);
});

//Auth
router.get("/explore", function (req, res, next) {
    if (development)
        res.json(signupMentor);
});

module.exports = router;
