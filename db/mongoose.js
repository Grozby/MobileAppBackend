var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://159.89.15.169:27017/mobileapp');

module.exports = {
    mongoose
};

