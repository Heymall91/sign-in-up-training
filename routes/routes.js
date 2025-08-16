const express = require('express');
const router = express.Router();
// controllers
const {UnauthorizedRenderController, AuthorizedRenderController} = require('../controllers/render-controller');
const signInUpcontroller = require('../controllers/sign-in-up-controller');
const EditProfile = require('../controllers/edit-profile-controller');
// middlewares
const authorization = require('../middlewares/authorization');
const userRedirect = require('../middlewares/user-redirect');
const tokenRefresh = require('../middlewares/token-refresh');
const tokenClean = require('../middlewares/token-clean');
// non-authorization routes
router.get('/', userRedirect, UnauthorizedRenderController.main);
router.get('/contacts', userRedirect, UnauthorizedRenderController.contacts);
router.get('/posts', userRedirect, UnauthorizedRenderController.posts);
router.get('/post/:id', userRedirect, UnauthorizedRenderController.post);
router.get('/about-us', userRedirect, UnauthorizedRenderController.aboutUs);
router.get('/support', userRedirect, UnauthorizedRenderController.support);
router.post('/support', userRedirect, UnauthorizedRenderController.supportSending);
router.get('/success', userRedirect, UnauthorizedRenderController.success);
// sign in
router.get('/signin', userRedirect, signInUpcontroller.getSignIn);
router.post('/signin', signInUpcontroller.signIn);
// sign up
router.get('/signup', userRedirect, signInUpcontroller.getSignUp);
router.post('/signup', signInUpcontroller.signUp);
// confirm
router.get('/confirm', userRedirect, signInUpcontroller.getConfirm);
router.post('/confirm', userRedirect, signInUpcontroller.postConfirm);
// user authorized routes
router.get('/main/user', authorization, AuthorizedRenderController.main);
router.get('/contacts/user', authorization, AuthorizedRenderController.contacts);
router.get('/posts/user', authorization, AuthorizedRenderController.posts);
router.get('/post/user/:id', authorization, AuthorizedRenderController.post);
router.get('/posts/user/create-post', authorization, AuthorizedRenderController.createPost);
router.get('/about-us/user', authorization, AuthorizedRenderController.aboutUs);
// profile edit
// menu
router.get('/user/edit-profile/', authorization, EditProfile.getEditProfile);
router.delete('/user/edit-profile/', authorization, EditProfile.removeProfile);
// name
router.get('/user/edit-name', authorization, EditProfile.getEditName);
router.put('/user/edit-name', tokenRefresh, authorization, EditProfile.putEditName);
// password
router.get('/user/edit-pass-confirm', authorization, EditProfile.getEditConfirm);
router.post('/user/edit-pass-confirm', authorization, EditProfile.postEditConfirm);
router.get('/user/edit-pass', authorization, EditProfile.getEditPass);
router.put('/user/edit-pass', authorization, tokenClean, EditProfile.putEditPass);
// post creating
router.post('/posts/user/create-post', authorization, AuthorizedRenderController.postSending);
// post editing
router.get('/post/user/edit/:id', authorization, AuthorizedRenderController.getEditPost);
router.put('/post/user/edit/:id', authorization, AuthorizedRenderController.editPost);
// post removing
router.delete('/post/user/:id', authorization, AuthorizedRenderController.removePost);
// support
router.get('/support/user', authorization, AuthorizedRenderController.support);
router.post('/support/user', authorization, AuthorizedRenderController.supportSending);
router.get('/success/user', authorization, AuthorizedRenderController.success);
// logout
router.get('/logout', AuthorizedRenderController.logout);

module.exports = router;