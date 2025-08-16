const mongoose = require('mongoose');
const { Schema } = mongoose;

const role = new Schema({
    value: {type: String, unique: true, default: "USER"}
});

const Role = mongoose.model("Role", role);

module.exports = Role;