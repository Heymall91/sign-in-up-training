const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const post = new Schema({
    writtenBy: {type: ObjectId, required: true},
    username: {type: String, required: true},
    usermail: {type: String, required: true},
    header: {type: String, required: true},
    content: {type: String, required: true}
}, {timestamps: true});

const Post = mongoose.model("Post", post);

module.exports = Post;