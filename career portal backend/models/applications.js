var bcrypt = require("bcrypt-nodejs");
var uuidV4 = require("uuid/v4");

var db = require("./db");

// Set up Job Application class
var Application = function (application) {
  var that = Object.create(Application.prototype);

  that.applicationId = application.applicationId;
  that.jobId = application.jobId;
  that.userId = application.userId;
  that.title = application.title;
  that.body = application.body;
  that.status = application.status;
  that.dateSent = application.dateSent;

  return that;
};

// Gets a random application id for the user
var generateApplicationId = function () {
  return uuidV4();
};

//Create a new job application
var createApplication = function (userId, jobId, title, cv, callback) {
  var newApplication = {
    applicationId: generateApplicationId(),
    jobId: jobId,
    userID: userId,
    title: title,
    cv: cv,
  };
  db.query(
    "INSERT INTO applications (applicationId, jobId, userId, title, description) values (?,?,?,?,?)",
    [
      newApplication.applicationId,
      newApplication.jobId,
      newApplication.userID,
      newApplication.title,
      newApplication.cv,
    ],
    function (err) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // If we somehow generated a duplicate user id, try again
          return createApplication(
            jobId,
            userId,
            title,
            cv,
            status,
            dateSent,
            callback
          );
        }
        return callback(err);
      }
      // Successfully created user
      //Now call updateRecruiterPostCount table to increment the active user's post count.
      return updateApplicationPostCount(newApplication, callback);
    }
  );
};

var updateApplicationPostCount = function (newApplication, callback) {
  db.query(
    "UPDATE PrimeUser SET numberJobsApplied = numberJobsApplied + 1 WHERE userId = ?",
    [newApplication.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successfully created user
      return callback(null, new Application(newApplication));
    }
  );
};

// List all applications matching a specific userId
var listMatchingApplications = function (userId, callback) {
  db.query("SELECT * FROM applications WHERE userId = ?", [userId], function (
    err,
    rows
  ) {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

// List all applications matching a specific title
var listApplicationsSearched = function (title, callback) {
  db.query("SELECT * FROM applications WHERE title = ?", [title], function (
    err,
    rows
  ) {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

// List all applications (Not sure if this is needed)
var listApplications = function (callback) {
  db.query("SELECT * FROM applications", [], function (err, rows) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

// Delete an application
// callback(err)
var deleteApplication = function (applicationId, callback) {
  db.query(
    "DELETE FROM applications WHERE applicationId = ?",
    [applicationId],
    callback
  );
};

exports.createApplication = createApplication;
exports.listMatchingApplications = listMatchingApplications;
exports.listApplicationsSearched = listApplicationsSearched;
exports.listApplications = listApplications;
exports.deleteApplication = deleteApplication;
