module.exports = (req, res, next) => {
    try {
        let tokenName;
        if (req.headers.cookie) {
            tokenName = req.headers.cookie.split('=')[0];
            if (tokenName.includes('bearer')) {
                switch (req.originalUrl) {
                    case '/':
                        return res.redirect('/main/user');
                    case '/contacts':
                        return res.redirect('/contacts/user');
                    case '/posts':
                        return res.redirect('/posts/user');
                    case '/post':
                        return res.redirect('/post/user/:id');
                    case '/about-us':
                        return res.redirect('/about-us/user');
                    case '/support':
                        return res.redirect('/support/user');
                    case '/confirm':
                        return res.redirect('/main/user');
                    default:
                        return res.redirect('/');
                }
            }
        }
        next();
    } catch (err) {
        console.log(err)
    }
}