const createPath = require('../create-path');
require('dotenv').config();
const transport = require('../mail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// models
const User = require('../models/user');

class EditProfile {

    getEditProfile = async (req, res) => {
        const userID = await User.findOne({usermail: req.user.usermail });
        return res.render(createPath('edit-profile', 'views/dashboard'), { title: 'Edit profile', username: req.user.username, usermail: req.user.usermail, userID: userID._id });
    };
    removeProfile = async (req, res) => {
        await User.findOneAndDelete({usermail: req.user.usermail });
        res.clearCookie('bearer');
        return res.render(createPath('edit-profile', 'views/dashboard'), { title: 'Edit profile', username: req.user.username, usermail: req.user.usermail});
    };
    getEditName = (req, res) => {
        return res.render(createPath('edit-name', 'views/dashboard'), { title: 'Edit name', username: req.user.username, usermail: req.user.usermail });
    };
    putEditName = async (req, res) => {
        const { username } = req.body;
        const user = await User.findOneAndUpdate({ usermail: req.user.usermail }, {
            username: username
        });

        if (!user) {
            res.status(403);
        }

        return res.redirect('/user/edit-profile');
    };
    getEditConfirm = async (req, res) => {
        const otpCode = crypto.randomInt(100000, 999999);
        await User.findOneAndUpdate({usermail: req.user.usermail}, {
            otp: otpCode
        });

        await transport.sendMail({
            from: process.env.SUPPORT_USER,
            to: req.user.usermail,
            subject: 'Your OTP code',
            text: `Your OTP code is: ${otpCode}. It will expired for 1 minute.`
        });

        return res.render(createPath('edit-pass-confirm', 'views/dashboard'), {title: 'Confirm your code', username: req.user.username, usermail: req.user.usermail})
    };
    postEditConfirm = async (req, res) => {
        const { confirm } = req.body;
        const user = await User.findOne({usermail: req.user.usermail});

        try{
            if(user.otp == confirm){
                return res.status(200).redirect('/user/edit-pass');
            } else{
                return res.status(403).json({message: "Irregular OTP code"});
            }
        } catch(err){
            return res.status(404);
        }        
    };
    getEditPass = async (req, res) => {
        // otp removing
        await User.updateOne({ usermail: req.user.usermail }, { $unset: { otp: 1 } });
        return res.render(createPath('edit-pass', 'views/dashboard'), { title: 'Edit', message: null, username: req.user.username, usermail: req.user.usermail });
    };
    putEditPass = async (req, res) => {
        try{
            const {userpass} = req.body;
            // models
            const user = await User.findOne({usermail: req.user.usermail});
            const passToDecode = await bcrypt.compare(userpass, user.userpass);

            if(passToDecode){
                res.status(403).render(createPath('edit-pass', 'views/dashboard'), {title: 'Edit', message: "You should create other password", username: null, usermail: null});
            }

            const passNew = await bcrypt.hash(userpass, 7);
            await user.updateOne({
                userpass: passNew
            }); 

            res.redirect('/signin');
        }catch(err){
            res.status(404);
        }
    };
}

module.exports = new EditProfile();