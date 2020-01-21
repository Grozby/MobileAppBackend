'use strict';

let express = require('express');
let router = express.Router();

router.get("/specializations",
    function (req, res) {
        return res.json([
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
        ]);
    });

router.get("/questions",
    function (req, res) {
        return res.json([
            'What are your favourite programming languages?',
            'What inspires you the most in your work?'
        ]);
    });

module.exports = router;

