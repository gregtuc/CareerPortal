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
var createJobSeekerUser = function (
  email,
  password,
  recoveryanswer,
  accounttype,
  paymenttype,
  paymentmethod,
  creditcardnumber,
  checkingnumber,
  description,
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
    "INSERT INTO pyc353_1.users ( userId, email, password, accountRecoveryAnswer, autoOrManual, paymentMethod, creditNo, checkingNo,monthlyFee,accountBalance) values (?,?,?,?,?,?,?,?,0,0)",
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
          return createJobSeekerUser(email, password, callback);
        }
        return callback(err);
      }
      // Create new jobseeker.
      db.query(
        "INSERT INTO pyc353_1.JobSeeker ( userId,category,profileDescription ) values (?,?,?)",
        [newUser.userId, accounttype, description],
        function (err) {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              // If we somehow generated a duplicate JobSeeker, try again
              return createJobSeekerUser(userId, callback);
            }
            return callback(err);
          }
          // If the job seeker is a prime user, create new prime user.
          if (accounttype === "Prime") {
            updateMonthlyFee(newUser, accounttype, callback);
            // Successfully created JobSeeker as prime user. Return the User.
            return callback(null, new User(newUser));
          } else if (accounttype === "Gold") {
            // Successfully created JobSeeker as Gold user. Return the User.
            updateMonthlyFee(newUser, accounttype, callback);
            return callback(null, new User(newUser));
          } else {
            return callback(null, new User(newUser));
          }
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
  accounttype,
  paymenttype,
  paymentmethod,
  creditcardnumber,
  checkingnumber,
  description,
  callback
) {
  // Check if there's already a user with that email
  db.query("SELECT * FROM pyc353_1.users WHERE email = ?", [email], function (
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
      return createJobSeekerUser(
        email,
        password,
        recoveryanswer,
        accounttype,
        paymenttype,
        paymentmethod,
        creditcardnumber,
        checkingnumber,
        description,
        callback
      );
    }
  });
};

//User will change is category base on what he chose
var changeCategory = function (user, category, fee, callback) {
  db.query(
    "UPDATE pyc353_1.JobSeeker r INNER JOIN users u ON (r.userId=u.userId) SET r.signUpDate = CURRENT_TIMESTAMP,u.monthlyFee=?, r.category = ? WHERE r.userId= ? AND u.userId=?",
    [fee, category, user.userId, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};
//User will change is payment type base on what he chose
var changePaymentType = function (user, type, callback) {
  db.query(
    "UPDATE  users SET autoOrManual= ? WHERE userId= ?",
    [type, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};
//User will change is paymentMethod base on what he chose
var changePaymentMethod = function (user, method, callback) {
  db.query(
    "UPDATE pyc353_1.users SET paymentMethod= ? WHERE userId= ?",
    [method, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};
//User will change is credit number base on what he chose
var changeCreditNb = function (user, nb, callback) {
  db.query(
    "UPDATE pyc353_1.users SET creditNo= ? WHERE userId= ?",
    [nb, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};
//User will change is checking number base on what he chose
var changeCheckingNb = function (user, nb, callback) {
  db.query(
    "UPDATE pyc353_1.users SET checkingNo= ? WHERE userId= ?",
    [nb, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};
//User will change is recovery answer base on what he chose
var changeRecoveryAnswer = function (user, answer, callback) {
  db.query(
    "UPDATE pyc353_1.users SET accountRecoveryAnswer= ? WHERE userId= ?",
    [answer, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};
//User will pay his desired amount
var userPayment = function (user, amount, callback) {
  db.query(
    "UPDATE pyc353_1.users SET accountBalance = accountBalance - ? WHERE userId= ?",
    [amount, user.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null, new User(user));
    }
  );
};

var updateMonthlyFee = function (newUser, category, callback) {
  if (category === "Prime") {
    db.query(
      "UPDATE pyc353_1.users SET monthlyFee = 10 WHERE userId= ?",
      [newUser.userId],
      function (err) {
        if (err) {
          return callback(err);
        }
        // Successfully added monthly fee and accountblance
        return callback(null, new User(newUser));
      }
    );
  } else if (category === "Gold") {
    console.log("Gold Category");
    db.query(
      "UPDATE pyc353_1.users SET monthlyFee = 20 WHERE userId= ?",
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
    console.log("Basic Category");
    db.query(
      "UPDATE pyc353_1.users SET monthlyFee = 0 WHERE userId= ?",
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
// List matching JobSeekkers
// callback(err, users)
var listMatchingJobseeker = function (userId, callback) {
  db.query(
    "SELECT * FROM pyc353_1.JobSeeker WHERE userId = ?",
    [userId],
    function (err, rows) {
      if (err) return callback(err);

      return callback(null, rows);
    }
  );
};

// List matching PrimeUser
// callback(err, users)
var listMatchingPrimeUser = function (userId, callback) {
  db.query(
    "SELECT * FROM pyc353_1.PrimeUser WHERE userId = ?",
    [userId],
    function (err, rows) {
      if (err) return callback(err);

      return callback(null, rows);
    }
  );
};

// List matching PrimeUser
// callback(err, users)
var listMatchingGoldUser = function (userId, callback) {
  db.query(
    "SELECT * FROM pyc353_1.GoldUser WHERE userId = ?",
    [userId],
    function (err, rows) {
      if (err) return callback(err);

      return callback(null, rows);
    }
  );
};

// List all Jobseeker
// callback(err, users)
var listJobseekers = function (callback) {
  db.query("SELECT * FROM pyc353_1.JobSeeker", [], function (err, rows) {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

// Delete a jobseeker
// callback(err)
var deleteJobseeker = function (userId, callback) {
  db.query("DELETE FROM JobSeeker WHERE userId = ?", [userId], function (err) {
    if (err) return callback(err);
    return callback(null);
  });
};

exports.createJobSeekerUser = createJobSeekerUser;
exports.listMatchingJobseeker = listMatchingJobseeker;
exports.listMatchingGoldUser = listMatchingGoldUser;
exports.listMatchingPrimeUser = listMatchingPrimeUser;
exports.signup = signup;
exports.listJobseekers = listJobseekers;
exports.deleteJobseeker = deleteJobseeker;
exports.changeCategory = changeCategory;
exports.changePaymentType = changePaymentType;
exports.changePaymentMethod = changePaymentMethod;
exports.changeCreditNb = changeCreditNb;
exports.changeCheckingNb = changeCheckingNb;
exports.changeRecoveryAnswer = changeRecoveryAnswer;
exports.userPayment = userPayment;
