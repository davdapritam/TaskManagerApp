// This will handle the connection logic to the mongoDB

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoUrl = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.2.3';

mongoose.connect(mongoUrl, {
    useNewUrlParser: true
}).then(() => {
    console.log("Connected To MongoDB :)");
}).catch((e) => {
    console.log("Error While Attempting to Connect MongoDB");
    console.log(e);
})


module.exports = { mongoose };