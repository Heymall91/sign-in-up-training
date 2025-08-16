const jwt = require('jsonwebtoken');
const { secretCode } = require('../config');

module.exports = (req, res, next) => {
    try {
        // getting info from old token
        res.clearCookie('bearer');
        const token = req.headers.cookie.split('=')[1];
        const decodedToken = jwt.verify(token, secretCode);
        req.user = decodedToken;
        // new token
        const {username} = req.body;
        const updatedToken = jwt.sign({username: username, usermail: req.user.usermail, roles: req.user.roles}, secretCode, {expiresIn: '30min'});
        res.clearCookie('bearer');
        res.cookie('bearer', updatedToken);
        next();
    } catch (error) {
        res.clearCookie('bearer');
        res.status(403).redirect('/signin');
    }
}