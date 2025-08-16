const { secretCode } = require('../config');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const cookieToken = req.headers.cookie.split('=')[1];
        const verifiedToken = jwt.verify(cookieToken, secretCode);
        try{
            if(!verifiedToken){
                res.redirect('/signin');
            }
            req.user = verifiedToken;
        }catch(err){
            res.clearCookie('bearer');
        }
        next();
    } catch (err) {
        res.clearCookie('bearer');
        return res.status(403).redirect('/signin');
    }
}