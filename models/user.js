const mongoose = require('mongoose');
const { Schema } = mongoose;

const user = new Schema({
    username: {type: String, required: true},
    usermail: {type: String, required: true},
    userpass: {type: String, required: true},
    roles: [{type: String, ref: "Role"}],
}, { timestamps: true, strict: false });

const User = mongoose.model("User", user);

module.exports = User;