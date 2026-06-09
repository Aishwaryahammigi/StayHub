const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();
const { saveRedirectUrl } = require('../middleware.js');

const userController = require('../controllers/users.js');

router.route('/signup')
.get(userController.renderSignupForm)
.post(userController.signup);

router.route('/login')
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/login'
}), userController.login);

router.route('/logout')
.get(userController.logout);

module.exports = router;
