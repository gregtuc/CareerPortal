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
var createUser = function (email, password, recoveryanswer, callback) {
  var newUser = {
    userId: generateUserId(),
    email: email,
    password: hashPassword(password),
    recoveryanswer: recoveryanswer,
  };
  db.query(
    "INSERT INTO users ( userId, email, password, accountRecoveryAnswer ) values (?,?,?,?)",
    [newUser.userId, newUser.email, newUser.password, newUser.recoveryanswer],
    function (err) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // If we somehow generated a duplicate user id, try again
          return createUser(email, password, callback);
        }
        return callback(err);
      }

      // Successfully created user
      return callback(null, new User(newUser));
    }
  );
};

// Check if a user exists and create them if they do not
// callback(err, newUser)
var signup = function (req, email, password, recoveryanswer, callback) {
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
      return createUser(email, password, recoveryanswer, callback);
    }
  });
};

// Log in a user
// callback(err, user)
var login = function (req, email, password, callback) {
  // Check that the user logging in exists
  db.query("SELECT * FROM users WHERE email = ?", [email], function (
    err,
    rows
  ) {
    if (err) return callback(err);

    if (!rows.length)
      return callback(null, false, req.flash("loginMessage", "No user found."));

    if (!validPassword(password, rows[0].password))
      return callback(
        null,
        false,
        req.flash("loginMessage", "Wrong password.")
      );

    // User successfully logged in, return user
    return callback(null, new User(rows[0]));
  });
};

// List all users
// callback(err, users)
var listUsers = function (callback) {
  db.query("SELECT * FROM users", [], function (err, rows) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

// Delete a user
// callback(err)
var deleteUser = function (userId, callback) {
  db.query("DELETE FROM users WHERE userId = ?", [userId], callback);
};

exports.signup = signup;
exports.login = login;
exports.listUsers = listUsers;
exports.deleteUser = deleteUser;