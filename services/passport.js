const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');


// Create local strategy
  // needed in addition to JwtStrategy bc users are going to be logging in without knowing about token (they will use email and password)
  // once they sign in with email and pass we hand them token from which they can make auth'd requests using jwtStrategy
  // We're not using username which is default, we tell localstrat to look at email property
const localOptions = {usernameField : 'email'};
const localLogin = new LocalStrategy(localOptions, function (email, password, done) {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  User.findOne({email: email}, function (err, user) {
    if (err) {return done(err);}
    if(!user) {return done(null, false);}
    
    // compare passwords = is 'password' equal to user.password
    user.comparePassword(password, function (err, isMatch) {
      if (err) {return done(err);}
      // didn't find user
      if (!isMatch) {return done(null, false);}
      
      // user model assigned to req.user
      return done(null, user);
    })
  });
});

// Set up options for JWT Strategy
const jwtOptions = {
  // look at request header called 'authorization' to find token
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT Strategy
// payload = decoded jwt token; done is cb function we need to call wther or not we succesfully authenticated user or not
const jwtLogin = new JwtStrategy (jwtOptions, function (payload, done) {
  // See if user ID in the payload exists in the databse
  // If it does, call 'done' with  that use
  // otherwise, call 'done' without a user
  User.findById(payload.sub, function (err, user) {
    // false: didnt find user
    if (err) { return done(err, false); }
    
    if (user) {
      // null: no error
      done(null, user)
    } else {
      // search couldnt find a user
      done(null, false)
    }
  })
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
