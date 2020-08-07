var db = require("./db");
var uuidV4 = require("uuid/v4");

// Set up Job class
var Job = function (job) {
  var that = Object.create(Job.prototype);

  that.jobId = job.jobId;
  that.jobId = job.jobId;
  that.jobTitle = job.jobtitle;
  that.jobDescription = job.description;
  that.numberApplicants = job.numberApplicants;

  return that;
};

// Gets a random id for this job
var generateJobId = function () {
  return uuidV4();
};

// Create a new job
// callback(err, newJob)
var createJob = function (
  userId,
  jobTitle,
  jobDescription,
  numEmployees,
  callback
) {
  var newJob = {
    jobId: generateJobId(),
    userId: userId,
    jobTitle: jobTitle,
    jobDescription: jobDescription,
    numEmployees: numEmployees,
  };
  db.query(
    "INSERT INTO jobs ( jobId, userId, jobTitle, description, numberEmployeesNeeded ) values (?,?,?,?,?)",
    [
      newJob.jobId,
      newJob.userId,
      newJob.jobTitle,
      newJob.jobDescription,
      newJob.numEmployees,
    ],
    function (err) {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          // If we somehow generated a duplicate user id, try again
          return createUser(email, password, callback);
        }
        return callback(err);
      }
      // Successfully created user
      //Now call updateRecruiterPostCount table to increment the active user's post count.
      return updateRecruiterPostCount(newJob, callback);
    }
  );
};

var updateRecruiterPostCount = function (newJob, callback) {
  db.query(
    "UPDATE recruiters SET jobPostedCount = jobPostedCount + 1 WHERE userId = ?",
    [newJob.userId],
    function (err) {
      if (err) {
        return callback(err);
      }
      // Successfully created user
      return callback(null, new Job(newJob));
    }
  );
};

// List all jobs matching a specific userId
// callback(err, users)
var listMatchingJobs = function (userId, callback) {
  db.query("SELECT * FROM jobs WHERE userId = ?", [userId], function (
    err,
    rows
  ) {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

// List all jobs
// callback(err, jobs)
var listJobs = function (callback) {
  db.query("SELECT * FROM jobs", [], function (err, rows) {
    if (err) return callback(err);

    return callback(null, rows);
  });
};

// Delete a job
// callback(err)
var deleteJob = function (jobId, callback) {
  db.query("DELETE FROM jobs WHERE jobId = ?", [jobId], callback);
};

exports.listMatchingJobs = listMatchingJobs;
exports.createJob = createJob;
exports.listJobs = listJobs;
exports.deleteJob = deleteJob;
