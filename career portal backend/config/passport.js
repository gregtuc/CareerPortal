var LocalStrategy = require("passport-local").Strategy;

var db = require("../models/db");
var user = require("../models/user");
var recruiter = require("../models/recruiter");
var jobseeker = require("../models/jobseeker");

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
        accountType: "accounttype",
        paymentType: "paymenttype",
        paymentMethod: "paymentMethod",
        creditCardNumber: "creditcardnumber",
        checkingNumber: "checkingnumber",
        passReqToCallback: true, // Pass the entire request back to the callback
      },
      function (req, username, password, done) {
        var recoveryanswer = req.body.recoveryanswer;
        var phonenumber = req.body.phonenumber;
        var accounttype = req.body.accounttype;
        var paymenttype = req.body.paymenttype;
        var paymentmethod = req.body.paymentmethod;
        var creditcardnumber = req.body.creditcardnumber;
        var checkingnumber = req.body.checkingnumber;
        recruiter.signup(
          req,
          username,
          password,
          recoveryanswer,
          phonenumber,
          accounttype,
          paymenttype,
          paymentmethod,
          creditcardnumber,
          checkingnumber,
          done
        );
      }
    )
  );

// Local jobseeker signup
  passport.use(
    "local-jobseeker-signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        recoveryAnswerField: "recoveryanswer",
        accountType: "accounttype",
        paymentType: "paymenttype",
        paymentMethod: "paymentMethod",
        creditCardNumber: "creditcardnumber",
        checkingNumber: "checkingnumber",
          description: "description",
        passReqToCallback: true, // Pass the entire request back to the callback
      },
      function (req, username, password, done) {
        var recoveryanswer = req.body.recoveryanswer;
        var accounttype = req.body.accounttype;
        var paymenttype = req.body.paymenttype;
        var paymentmethod = req.body.paymentmethod;
        var creditcardnumber = req.body.creditcardnumber;
        var checkingnumber = req.body.checkingnumber;
        var description = req.body.description;
        jobseeker.signup(
          req,
          username,
          password,
          recoveryanswer,
          accounttype,
          paymenttype,
          paymentmethod,
          creditcardnumber,
          checkingnumber,
          description,
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
