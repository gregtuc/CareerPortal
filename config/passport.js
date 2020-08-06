var LocalStrategy = require("passport-local").Strategy;

var db = require("../models/db");
var user = require("../models/user");
var recruiter = require("../models/recruiter");

module.exports = function (passport) {
  // Passport session setup, required for persistent login sessions
  // Used to serialize and unserialize users out of session
  passport.serializeUser(function (user, done) {
    done(null, user.userId);
  });

  passport.deserializeUser(function (userId, done) {
    db.query("SELECT * FROM users WHERE userId = ?", [userId], function (
      err,
      rows
    ) {
      done(err, rows[0]);
    });
  });

  // Local user signup
  passport.use(
    "local-user-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        recoveryanswerField: "recoveryanswer",
        passReqToCallback: true, // Pass the entire request back to the callback
      },
      function (req, username, password, done) {
        var recoveryanswer = req.body.recoveryanswer;
        user.signup(req, username, password, recoveryanswer, done);
      }
    )
  );

  // Local recruiter signup
  passport.use(
    "local-recruiter-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        recoveryAnswerField: "recoveryanswer",
        phoneNumber: "phonenumber",
        passReqToCallback: true, // Pass the entire request back to the callback
      },
      function (req, username, password, done) {
        var recoveryanswer = req.body.recoveryanswer;
        var phonenumber = req.body.phonenumber;
        recruiter.signup(
          req,
          username,
          password,
          recoveryanswer,
          phonenumber,
          done
        );
      }
    )
  );

  // Local login
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true, // Pass the entire request back to the callback
      },
      user.login
    )
  );
};
