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
        req.session.save(() => {
          res.redirect('/signup');
        });
        return;
      }
      req.flash('success', `Successfully signed in as ${user.username}, welcome ${user.username} to StayHub!`);
      req.session.save(() => {
        res.redirect('/listings');
      });
    });
  } catch (e) {
    console.error('signup error catch:', e);
    req.flash('error', e && e.message ? e.message : String(e));
    req.session.save(() => {
      res.redirect('/signup');
    });
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render('login');
};

module.exports.login = (req, res) => {
  const username = req.user ? req.user.username : "";
  req.flash("success", `Welcome back ${username} to StayHub!`);
  let redirectUrl = res.locals.redirectUrl || '/listings';
  req.session.save(() => {
    res.redirect(redirectUrl);
  });
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have logged out successfully!");
    req.session.save(() => {
      res.redirect('/listings');
    });
  });
};