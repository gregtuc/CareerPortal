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
    "INSERT INTO MyDatabase.applications (applicationId, jobId, userId, title, description, status) values (?,?,?,?,?,?)",
    [
      newApplication.applicationId,
      newApplication.jobId,
      newApplication.userID,
      newApplication.title,
      newApplication.cv,
      "Submitted",
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
      // Successfully created application
      //Now call updateRecruiterPostCount table to increment the active user's post count.
      return updateApplicationPostCount(newApplication, callback);
    }
  );
};

var updateApplicationPostCount = function (newApplication, callback) {
  db.query(
    "UPDATE MyDatabase.JobSeeker SET numberJobsApplied = numberJobsApplied + 1 WHERE userId = ?",
    [newApplication.userID],
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
  db.query(
    "SELECT * FROM MyDatabase.applications WHERE userId = ?",
    [userId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

// List all applications matching a specific title
var listApplicationsSearched = function (title, callback) {
  db.query(
    "SELECT * FROM MyDatabase.applications WHERE title = ?",
    [title],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

// List all applications (Not sure if this is needed)
var listApplications = function (callback) {
  db.query("SELECT * FROM MyDatabase.applications", [], function (err, rows) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

var listSubmissions = function (employerId, callback) {
  console.log(employerId);
  db.query(
    "SELECT applicationId, jobTitle, title,applications.description, applications.status, jobCategory, numberEmployeesNeeded \n" +
      "FROM MyDatabase.applications, MyDatabase.jobs \n" +
      "where employerId = ? AND applications.jobId = jobs.jobId",
    [employerId],
    function (err, rows) {
      if (err) return callback(err);

      return callback(null, rows);
    }
  );
};

// Delete an application
// callback(err)
var deleteApplication = function (applicationId, userId, callback) {
  db.query(
    "DELETE FROM MyDatabase.applications WHERE applicationId = ?",
    [applicationId],
    function (err) {
      if (err) callback(err);
      return decreaseApplicationPostCount(userId, callback);
    }
  );
};
var decreaseApplicationPostCount = function (userID, callback) {
  db.query(
    "UPDATE MyDatabase.JobSeeker SET numberJobsApplied = numberJobsApplied - 1 WHERE userId = ?",
    [userID],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successful
      return callback(null);
    }
  );
};
var getApplications = function (applicationId, callback) {
  db.query(
    "SELECT numberEmployeesNeeded,jobs.jobId FROM MyDatabase.applications, MyDatabase.jobs WHERE applicationId = ? AND applications.jobId = jobs.jobId",
    [applicationId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

var offerSent = function (applicationId, callback) {
  db.query(
    "UPDATE MyDatabase.applications SET status = 'Offer Sent' WHERE applicationId = ?",
    [applicationId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

var takeSpot = function (jobId, callback) {
  db.query(
    "UPDATE MyDatabase.jobs SET numberEmployeesNeeded = numberEmployeesNeeded - 1 WHERE jobId = ?",
    [jobId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

var declineOthers = function (applicationId, jobId, callback) {
  db.query(
    "UPDATE MyDatabase.applications SET status = 'Candidacy not considered' WHERE applicationId != ? AND applications.jobId = ? ",
    [applicationId, jobId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

var declineApplication = function (applicationId, callback) {
  db.query(
    "UPDATE MyDatabase.applications SET status = 'Candidacy not considered' WHERE applicationId = ?",
    [applicationId],
    function (err, rows) {
      if (err) return callback(err);
      return callback(null, rows);
    }
  );
};

exports.createApplication = createApplication;
exports.listMatchingApplications = listMatchingApplications;
exports.listApplicationsSearched = listApplicationsSearched;
exports.listApplications = listApplications;
exports.deleteApplication = deleteApplication;
exports.listSubmissions = listSubmissions;
exports.getApplications = getApplications;
exports.offerSent = offerSent;
exports.takeSpot = takeSpot;
exports.declineApplication = declineApplication;
exports.declineOthers = declineOthers;
