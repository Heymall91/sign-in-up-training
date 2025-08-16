require('dotenv').config();
// models
const User = require('../models/user');
const Role = require('../models/role');
const Candidate = require('../models/candidate');
// helpers
const transporter = require('../mail');
const createPath = require('../create-path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
// jwt
const jwt = require('jsonwebtoken');
// config
const { secretCode } = require('../config');

// controller
class SignInUpController{
    getSignIn = (req, res) => {
        try{
            return res.render(createPath('signin', 'views'), {title: "Sign in", message: null});
        }
        catch(err){
            return res.status(400).json({message: "Sign in error"});
        }
    };
    getSignUp = (req, res) => {
        try{
            return res.render(createPath('signup', 'views'), {title: "Sign up", message: null});
        }
        catch(err){
            return res.status(400).json({ message: "Sign up error"});
        }
    };
    async signUp(req, res){
        try {
            // creating OTP
            const otpCode = crypto.randomInt(100000, 999999);

            // user creating
            const { username, usermail, userpass } = req.body;
            const hashedPass = bcrypt.hashSync(userpass, 7);
            const user = await User.findOne({usermail: usermail});
            if(user){
                res.status(401).render(createPath('signup', 'views'), {message: "This user already signed up!"});
            }
            else{
                // candidate
                const candidate = new Candidate({
                    username: username,
                    usermail: usermail.toLowerCase(),
                    userpass: hashedPass,
                    otp: otpCode,
                    otpExpired: Date.now() + 5 * 60 * 1000,
                });
                await candidate.save();

                if (candidate.otp) {
                    await transporter.sendMail({
                        from: "heymall91@gmail.com",
                        to: usermail,
                        subject: "Your OTP code",
                        text: `Verify your email now! Your code is: ${candidate.otp}. It will be expired for 5 minutes`
                    });
                };

                // confirm email notification and redirect

                const toConfirm = jwt.sign({ usermail: usermail }, secretCode, { expiresIn: "5min" });
                res.cookie('toConfirm', toConfirm);
                return res.redirect('/confirm');
            }
        }
        catch (err) {
            console.log(err)
            return res.status(400).json(err);
        }
    };
    async signIn(req, res){
        try{
            const { usermail, userpass } = req.body;
            const user = await User.findOne({usermail: usermail});

            if(!user){
                return res.status(401).render(createPath('signin', 'views'), {title: "Sign in", message: "User doesn't exist"});
            }
            const checkedPass = bcrypt.compareSync(userpass, user.userpass);
            if(!checkedPass){
                res.clearCookie('bearer');
                return res.status(403).render(createPath('signin', 'views'), {title: "Sign in", message: "Uncorrect password"});
            }
            const token = jwt.sign({ username: user.username, usermail: usermail, roles: user.roles}, secretCode, {expiresIn: "30min"});
            res.cookie('bearer', token);

            return res.redirect('/main/user');
        }
        catch(err){
            return res.status(401).json({message:"Failed sign in"});
        }
    };
    async getConfirm(req, res){
        const tokenToVerify = req.headers.cookie.split('=')[1];
        const token = jwt.verify(tokenToVerify, secretCode);
        const candidate = await Candidate.findOne({usermail: token.usermail});
        setTimeout( async () => {
            await Candidate.findOneAndDelete({usermail: token.usermail});
            res.clearCookie('toConfirm');
            return res.redirect('/signup');
        }, candidate.otpExpired - Date.now());

        try{
            return res.render(createPath("confirm", "views"), {title: "Confirm"});
        }
        catch(err){
            return res.status(400).redirect('/error');
        }
    };
    async postConfirm (req, res){
        try{
            const { otp__code } = req.body;
            const tokenToVerify = req.headers.cookie.split('=')[1];
            const tokenConfirm = jwt.verify(tokenToVerify, secretCode);
            // models
            const candidate = await Candidate.findOne({usermail: tokenConfirm.usermail});
            const role = await Role.findOne({ value: "USER" });

            if(candidate.otp === otp__code){
                try{
                    const user = new User({
                    username: candidate.username,
                    usermail: candidate.usermail,
                    userpass: candidate.userpass,
                    roles: [role.value]
                    });
                    await user.save();

                    const token = jwt.sign({username: user.username, usermail: user.usermail, roles: user.roles}, secretCode, {expiresIn: "30min"});
                    res.cookie('bearer', token);

                    await Candidate.findOneAndDelete({usermail: tokenConfirm.usermail});
                    res.clearCookie('toConfirm');
                    return res.redirect('/main/user');
                } catch(err){
                    console.log(err);
                    return res.status(401).redirect('/error');
                }
            }
            await Candidate.findOneAndDelete({usermail: tokenConfirm.usermail});
        }
        catch(err){
            return res.status(400).json({message: "Confirm error"});
        }
    };
};

module.exports = new SignInUpController();
