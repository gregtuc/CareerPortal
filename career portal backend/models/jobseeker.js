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
    "INSERT INTO users ( userId, email, password, accountRecoveryAnswer, autoOrManual, paymentMethod, creditNo, checkingNo,monthlyFee,accountBalance) values (?,?,?,?,?,?,?,?,0,0)",
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
        "INSERT INTO jobseeker ( userId,category,profileDescription ) values (?,?,?)",
        [newUser.userId, accounttype,description],
        function (err) {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              // If we somehow generated a duplicate JobSeeker, try again
              return createJobSeekerUser(userId, callback);
            }
            return callback(err);
          }
          // If the job seeker is a prime user, create new prime user.
          if(accounttype==="Prime")
          {
              console.log("Creating prime Category");
              db.query(
                  "INSERT INTO PrimeUser ( userId ) values (?)",
                  [newUser.userId],
                  function (err) {
                      if (err) {
                          if (err.code === "ER_DUP_ENTRY") {
                              // If we somehow generated a duplicate PrimeUser, try again
                              return createJobSeekerUser(userId, callback);
                          }
                          return callback(err);
                      }
                      updateMonthlyFee(newUser,accounttype,callback);
                      // Successfully created JobSeeker as prime user. Return the User.
                      return callback(null, new User(newUser));
                  });
        }
          else if(accounttype==="Gold")
          {
            db.query(
                "INSERT INTO GoldUser ( userId ) values (?)",
                [newUser.userId],
                function (err) {
                  if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                      // If we somehow generated a duplicate JobSeeker, try again
                      return createJobSeekerUser(userId, callback);
                    }
                    return callback(err);
                  }
                  // Successfully created JobSeeker as Gold user. Return the User.
                    updateMonthlyFee(newUser,accounttype,callback);
                  return callback(null, new User(newUser));
                });
          }
          else
          {
            return callback(null, new User(newUser));
          }
      });
    });
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
var changeCategory = function(user,category,fee,callback) {
    db.query(
        "UPDATE JobSeeker r INNER JOIN users u ON (r.userId=u.userId) SET u.monthlyFee=?, r.category = ? WHERE r.userId= ? AND u.userId=?",
        [fee,category,user.userId,user.userId],
        function (err) {
            if (err) {
                return callback(err);
            }
            // Successfully added monthly fee and account balance
            return callback(null,new User(user));
        });
}

var addGoldUser = function (userId,callback){
    db.query(
        "INSERT INTO GoldUser ( userId ) values (?)",
        [newUser.userId],
        function (err) {
            if (err) {
                return callback(err);
            }
            // Successfully created JobSeeker as Gold user. Return the User.
            return callback(null, new User(newUser));
        });
}

var addPrimeUser = function (userId,callback){
    db.query(
        "INSERT INTO PrimeUser ( userId ) values (?)",
        [newUser.userId],
        function (err) {
            if (err) {
                return callback(err);
            }
            // Successfully created JobSeeker as Gold user. Return the User.
            return callback(null, new User(newUser));
        });
}


var updateMonthlyFee = function(newUser,category,callback){
if(category === "Prime") {
    db.query(
        "UPDATE users SET monthlyFee = 10 WHERE userId= ?",
        [newUser.userId],
        function (err) {
            if (err) {
                return callback(err);
            }
            // Successfully added monthly fee and accountblance
            return callback(null,new User(newUser));
        });
}
else if (category==="Gold"){
    console.log("Gold Category");
    db.query(
        "UPDATE users SET monthlyFee = 20 WHERE userId= ?",
        [newUser.userId],
        function (err) {
            if (err) {
                return callback(err);
            }
            // Successfully added monthly fee and accountblance
            return callback(null,new User(newUser));
        });
}
else{
    console.log("Basic Category");
    db.query(
        "UPDATE users SET monthlyFee = 0 WHERE userId= ?",
        [newUser.userId],
        function (err) {
            if (err) {
                return callback(err);
            }
            // Successfully added monthly fee and accountblance
            return callback(null,new User(newUser));
        });
}
}
// List matching JobSeekkers
// callback(err, users)
var listMatchingJobseeker = function (userId, callback) {
  db.query("SELECT * FROM JobSeeker WHERE userId = ?", [userId], function (
    err,
    rows
  ) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

// List matching PrimeUser
// callback(err, users)
var listMatchingPrimeUser = function (userId, callback) {
    db.query("SELECT * FROM MyDatabase.PrimeUser WHERE userId = ?", [userId], function (
        err,
        rows
    ) {
        if (err) return callback(err);

        return callback(null, rows);
    });
};

// List matching PrimeUser
// callback(err, users)
var listMatchingGoldUser = function (userId, callback) {
    db.query("SELECT * FROM MyDatabase.GoldUser WHERE userId = ?", [userId], function (
        err,
        rows
    ) {
        if (err) return callback(err);

        return callback(null, rows);
    });
};

// List all Jobseeker
// callback(err, users)
var listJobseekers = function (callback) {
  db.query("SELECT * FROM MyDatabase.JobSeeker", [], function (err, rows) {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

// Delete a jobseeker
// callback(err)
var deleteJobseeker = function (userId, callback) {
        db.query("DELETE FROM JobSeeker WHERE userId = ?",
            [userId],
            function (err) {
            if (err) return callback(err);
            return callback(null);
        });
};

var deletePrimeUser= function (userId, callback) {
    db.query("DELETE FROM PrimeUser WHERE userId = ?", [userId], function (err) {
        if (err) return callback(err);

        return callback(null);
    });
};
var deleteGoldUser= function (userId, callback) {
    db.query("DELETE FROM GoldUser WHERE userId = ?", [userId],function (err) {
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
exports.deletePrimeUser = deletePrimeUser;
exports.deleteGoldUser = deleteGoldUser;
exports.addGoldUser = addGoldUser;
