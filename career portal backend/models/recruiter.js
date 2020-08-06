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
  callback
) {
  console.log("made it to users");
  var newUser = {
    userId: generateUserId(),
    email: email,
    password: hashPassword(password),
    recoveryanswer: recoveryanswer,
  };
  console.log("Made it here");
  db.query(
    "INSERT INTO users ( userId, email, password, accountRecoveryAnswer ) values (?,?,?,?)",
    [newUser.userId, newUser.email, newUser.password, newUser.recoveryanswer],
    function (err) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // If we somehow generated a duplicate user id, try again
          return createRecruiterUser(email, password, callback);
        }
        return callback(err);
      }

      // If phone number was passed, create Recruiter and then return the User.
      if (phonenumber) {
        db.query(
          "INSERT INTO recruiters ( userId, phoneNo ) values (?,?)",
          [newUser.userId, phonenumber],
          function (err) {
            if (err) {
              if (err.code === "ER_DUP_ENTRY") {
                // If we somehow generated a duplicate recruiter, try again
                return createRecruiterUser(userId, phonenumber, callback);
              }
              return callback(err);
            }
            // Successfully created recruiter. Return the User.
            return callback(null, new User(newUser));
          }
        );
      } else {
        // If no phone number was passed just return the User.
        return callback(null, new User(newUser));
      }
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
  callback
) {
  // Check if there's already a user with that email
  db.query("SELECT * FROM users WHERE email = ?", [email], function (
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
        callback
      );
    }
  });
};

// List all recruiters
// callback(err, users)
var listRecruiters = function (callback) {
  db.query("SELECT * FROM recruiters", [], function (err, rows) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

// Delete a recruiter
// callback(err)
var deleteRecruiters = function (userId, callback) {
  db.query("DELETE FROM recruiters WHERE userId = ?", [userId], callback);
};

exports.createRecruiterUser = createRecruiterUser;
exports.signup = signup;
exports.listRecruiters = listRecruiters;
exports.deleteRecruiters = deleteRecruiters;
