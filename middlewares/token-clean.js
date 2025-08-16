module.exports = (req, res, next) => {
    res.clearCookie('bearer');
    next();
}