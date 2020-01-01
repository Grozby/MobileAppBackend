var mongoose = require('mongoose');

mongoose.set('debug', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://159.89.15.169:27017/mobileapp', {
    useNewUrlParser: true,
    reconnectTries: Number.MAX_VALUE,
    autoReconnect: true
}).then(
    () => {
        console.log('Database is connected')
    },
    err => {
        console.log('Can not connect to the database' + err)
    }
);

module.exports = {
    mongoose
};

