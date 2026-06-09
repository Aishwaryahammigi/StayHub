const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render('signup');
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/signup');
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists.');
      return res.redirect('/signup');
    }

    const user = new User({ username, email });
    await user.setPassword(password);
    await user.save();
    console.log('Registered User:', user);

    req.login(user, (err) => {
      if (err) {
        console.error('req.login error:', err);
        req.flash('error', err && err.message ? err.message : 'Login error');
        return res.redirect('/signup');
      }
      req.flash('success', 'Welcome to Wanderlust!');
      res.redirect('/listings');
    });
  } catch (e) {
    console.error('signup error catch:', e);
    req.flash('error', e && e.message ? e.message : String(e));
    res.redirect('/signup');
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render('login');
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to wanderlust!");
  let redirectUrl = res.locals.redirectUrl || '/listings';
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out successfully!");
    res.redirect('/listings');
  });
};