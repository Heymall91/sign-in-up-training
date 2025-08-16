const mongoose = require('mongoose');
const { Schema } = mongoose;

const candidate = new Schema({
    username: {type: String, required: true},
    usermail: {type: String, required: true},
    userpass: {type: String, required: true},
    otp: {type: String},
    otpExpired: {type: Date},
});

const Candidate = mongoose.model("Candidate", candidate);

module.exports = Candidate;