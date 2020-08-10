var bcrypt = require("bcrypt-nodejs");
var uuidV4 = require("uuid/v4");

var db = require("./db");

// Set up User class
var User = function (user) {
  var that = Object.create(User.prototype);

  that.userId = user.userId;
  that.email = user.email;
  that.password = user.password;
  that.recoveryanswer = user.recoveryanswer;

  return that;
};

// Gets a random id for this user
var generateUserId = function () {
  return uuidV4();
};

// Hash and salt the password with bcrypt
var hashPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if password is correct
var validPassword = function (password, savedPassword) {
  return bcrypt.compareSync(password, savedPassword);
};

// Create a new user
// callback(err, newUser)
var createRecruiterUser = function (
  email,
  password,
  recoveryanswer,
  phonenumber,
  accounttype,
  paymenttype,
  paymentmethod,
  creditcardnumber,
  checkingnumber,
  callback
) {
  var newUser = {
    userId: generateUserId(),
    email: email,
    password: hashPassword(password),
    recoveryanswer: recoveryanswer,
    paymenttype: paymenttype,
    paymentmethod: paymentmethod,
    creditcardnumber: creditcardnumber,
    checkingnumber: checkingnumber,
  };
  db.query(
    "INSERT INTO MyDatabase.users ( userId, email, password, accountRecoveryAnswer, autoOrManual, paymentMethod, creditNo, checkingNo,monthlyFee,accountBalance) values (?,?,?,?,?,?,?,?,0,0)",
    [
      newUser.userId,
      newUser.email,
      newUser.password,
      newUser.recoveryanswer,
      newUser.paymenttype,
      newUser.paymentmethod,
      newUser.creditcardnumber,
      newUser.checkingnumber,
    ],
    function (err) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // If we somehow generated a duplicate user id, try again
          return createRecruiterUser(email, password, callback);
        }
        return callback(err);
      }
      // If phone number was passed, create Recruiter and then return the User.
      db.query(
        "INSERT INTO MyDatabase.Recruiter ( userId, phoneNo, employerCategory ) values (?,?,?)",
        [newUser.userId, phonenumber, accounttype],
        function (err) {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              // If we somehow generated a duplicate recruiter, try again
              return createRecruiterUser(userId, phonenumber, callback);
            }
            return callback(err);
          }
          updateMonthlyFee(newUser, accounttype, callback);
          // Successfully created recruiter. Return the User.
          return callback(null, new User(newUser));
        }
      );
    }
  );
};

// Check if a user exists and create them if they do not
// callback(err, newUser)
var signup = function (
  req,
  email,
  password,
  recoveryanswer,
  phonenumber,
  accounttype,
  paymenttype,
  paymentmethod,
  creditcardnumber,
  checkingnumber,
  callback
) {
  // Check if there's already a user with that email
  db.query("SELECT * FROM MyDatabase.users WHERE email = ?", [email], function (
    err,
    rows
  ) {
    if (err) return callback(err);

    if (rows.length) {
      return callback(
        null,
        false,
        req.flash(
          "signupMessage",
          "An account with that email address already exists."
        )
      );
    } else {
      // No user exists, create the user
      return createRecruiterUser(
        email,
        password,
        recoveryanswer,
        phonenumber,
        accounttype,
        paymenttype,
        paymentmethod,
        creditcardnumber,
        checkingnumber,
        callback
      );
    }
  });
};
//User will change is category base on what he chose
var changeCategory = function (user, category, fee, callback) {
  db.query(
    "UPDATE MyDatabase.Recruiter r INNER JOIN MyDatabase.users u ON (r.userId=u.userId) SET u.monthlyFee=?, r.employerCategory = ? WHERE r.userId= ? AND u.userId=?",
    [fee, category, user.userId, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successfully added monthly fee and account balance
      return callback(null, new User(user));
    }
  );
};
var updateMonthlyFee = function (newUser, category, callback) {
  if (category === "Gold") {
    console.log("Gold Category");
    db.query(
      "UPDATE MyDatabase.users SET monthlyFee = 100 WHERE userId= ?",
      [newUser.userId],
      function (err) {
        if (err) {
          return callback(err);
        }
        // Successfully added monthly fee and accountblance
        return callback(null, new User(newUser));
      }
    );
  } else {
    db.query(
      "UPDATE MyDatabase.users SET monthlyFee = 50 WHERE userId= ?",
      [newUser.userId],
      function (err) {
        if (err) {
          return callback(err);
        }
        // Successfully added monthly fee and accountblance
        return callback(null, new User(newUser));
      }
    );
  }
};
// List all recruiters
// callback(err, users)
var listMatchingRecruiters = function (userId, callback) {
  db.query(
    "SELECT * FROM MyDatabase.Recruiter WHERE userId = ?",
    [userId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

// List all recruiters
// callback(err, users)
var checkRecruiterAdmin = function (userId, callback) {
  db.query(
    "SELECT * FROM MyDatabase.Recruiter WHERE userId = ? AND admin = ?",
    [userId, 1],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

// List all recruiters
// callback(err, users)
var listRecruiters = function (callback) {
  db.query("SELECT * FROM MyDatabase.Recruiter", [], function (err, rows) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

// Delete a recruiter
// callback(err)
var deleteRecruiters = function (userId, callback) {
  db.query(
    "DELETE FROM MyDatabase.Recruiter WHERE userId = ?",
    [userId],
    callback
  );
};

exports.createRecruiterUser = createRecruiterUser;
exports.listMatchingRecruiters = listMatchingRecruiters;
exports.signup = signup;
exports.listRecruiters = listRecruiters;
exports.deleteRecruiters = deleteRecruiters;
exports.changeCategory = changeCategory;
exports.updateMonthlyFee = updateMonthlyFee;
exports.checkRecruiterAdmin = checkRecruiterAdmin;
