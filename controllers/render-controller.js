const createPath = require('../create-path');
const transport = require('../mail');
// models
const User = require('../models/user');
const Post = require('../models/post');

class UnauthorizedRenderController{
    main = (req, res) => {
        return res.render(createPath('index', 'views'), {title: 'Main'});
    };
    contacts = (req, res) => {
        return res.render(createPath('contacts', 'views'), {title: "Contacts"});
    };
    posts = async (req, res) => {
        const posts = await Post.find({}).sort({_id: -1});
        return res.render(createPath('posts', 'views'), {posts, title: "Posts"});
    };
    post = async (req, res) => {
        const { id } = req.params;
        const post = await Post.findById(id);
        return res.render(createPath('post', 'views'), {post, title: "Post"});
    };
    aboutUs = (req, res) => {
        return res.render(createPath('about-us', 'views'), {title: "About us"});
    };
    support = (req, res) => {
        return res.render(createPath('support', 'views'), {title: "Support"});
    };
    supportSending = async (req, res) => {
        const { usermail, subject, suptext } = req.body;
        try{
            await transport.sendMail({
                from: 'Website Support <heymall91@gmail.com>',
                to: "heymall91@gmail.com",
                replyTo: usermail,
                subject: `List from ${usermail}: ${subject}`,
                text: `${suptext}`
            })
            return res.redirect('/success');
        } catch(err){
            return res.status(400).render(createPath('error', 'views'), {title: "Your message doesn't received"});
        }
    };
    success = (req, res) => {
        return res.render(createPath('success', 'views'), {title: "Gratulations!"});
    };
}
class AuthorizedRenderController{
    main = (req, res) => {
        try{
            return res.render(createPath('main', 'views/dashboard'), {title: "Welcome!", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(400).json("Malfoned token");
        }
    };
    contacts = (req, res) => {
        try{
            return res.render(createPath('contacts', 'views/dashboard'), {title: "Your contacts", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(400).json("Malfoned token");
        }
    };
    posts = async (req, res) => {
        try{
            const posts = await Post.find().sort({_id: -1});
            return res.render(createPath('posts', 'views/dashboard'), {posts, title: "Posts", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(400).json("Malfoned token");
        }
    };
    post = async (req, res) => {
        const { id } = req.params;
        const post = await Post.findById(id);
        if(req.user.usermail == post.usermail){
            return res.render(createPath('post', 'views/dashboard'), {post, postId: id, appear: true, title: "Post", username: req.user.username, usermail: req.user.usermail});
        } else{
            return res.render(createPath('post', 'views/dashboard'), {post, postId: id, appear: false, title: "Post", username: req.user.username, usermail: req.user.usermail});
        }
    };
    postSending = async (req, res) => {
        try{
            const { header, content } = req.body;
            const { username, usermail} = req.user;
            const user_id = await User.findOne({username: username});
            const post = new Post({
                writtenBy: user_id._id,
                username,
                usermail: usermail.toLowerCase(),
                header,
                content,
            })
            await post.save();
            return res.redirect('/posts/user');
        }
        catch(err){
            console.log(err)
            return res.status(400).json(err);
        }
    };
    createPost = (req, res) => {
        try{
            return res.render(createPath('post-creating', 'views/dashboard'), {title: "Create your post", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(400).json("Malfoned token");
        }
    };
    removePost = async (req, res) => {
        const {id} = req.params;
        try {
            await Post.findByIdAndDelete({_id: id});
            return res.redirect('/posts/user');
        } catch (error) {
            console.log(error);
        }
    };
    getEditPost = async (req, res) => {
        try{
            const { id } = req.params;
            const post = await Post.findById(id);
            return res.render(createPath('edit-post', 'views/dashboard'), {post, id: post._id, title: "Edit your post", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(404);
        }
    };
    editPost = async (req, res) => {
        try{
            const { header, content } = req.body;
            const { id } = req.params;
            const postEdit = await Post.findByIdAndUpdate(id, {
                header: header,
                content: content.trim()
            });
            if(!postEdit){
                return res.status(403);
            };
            return res.redirect(`/post/user/${id}`);
        } catch(err){
            res.status(403);
        }
    };
    aboutUs = (req, res) => {
        try{
            return res.render(createPath('about-us', 'views/dashboard'), {title: "About Us", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(404);
        }
    };
    support = (req, res) => {
        try{
            return res.render(createPath('support', 'views/dashboard'), {title: "Support", username: req.user.username, usermail: req.user.usermail});
        }
        catch(err){
            return res.status(400).json("Malfoned token");
        }
    };
    supportSending = async (req, res) => {
        const { subject, suptext } = req.body;
        try{
            await transport.sendMail({
                from: 'Website Support <heymall91@gmail.com>',
                to: "heymall91@gmail.com",
                replyTo: req.user.usermail,
                subject: `List from ${req.user.usermail}: ${subject}`,
                text: `${suptext}`
            })
            return res.redirect('/success/user');
        } catch(err){
            return res.status(400).render(createPath('error', 'views'), {title: "Your message doesn't received"});
        }
    };
    success = (req, res) => {
        return res.render(createPath('success', 'views/dashboard'), {title: "Gratulations!", username: req.user.username});
    };
    logout = (req, res) => {
        try{
            return res
                .clearCookie('bearer')
                .redirect('/signin');
        }
        catch(err){
            return res.status(400).json("Error");
        }
    };
}
module.exports = {UnauthorizedRenderController: new UnauthorizedRenderController(), AuthorizedRenderController: new AuthorizedRenderController()};