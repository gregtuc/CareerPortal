var db = require("./db");
var uuidV4 = require("uuid/v4");

// Set up Job class
var Job = function (job) {
  var that = Object.create(Job.prototype);

  that.jobId = job.jobId;
  that.jobTitle = job.jobTitle;
  that.jobDescription = job.description;
  that.numberEmployeesNeeded = job.numberEmployeesNeeded;
  that.status = job.jobStatus;
  that.jobCategory= job.jobCategory;
  return that;
};

// sets default active status for a new job created
var defaultStatus = function () {
  return (jobStatus = "Active");
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
  numberEmployeesNeeded,
  jobStatus,
  jobCategory,
  callback
) {
  var newJob = {
    jobId: generateJobId(),
    userId: userId,
    jobTitle: jobTitle,
    jobDescription: jobDescription,
    numberEmployeesNeeded: numberEmployeesNeeded,
    jobStatus: defaultStatus(),
    jobCategory: jobCategory,
  };
  db.query(
    "INSERT INTO jobs ( jobId, employerId, jobTitle, description, numberEmployeesNeeded,status,jobCategory) values (?,?,?,?,?,?,?)",
    [
      newJob.jobId,
      newJob.userId,
      newJob.jobTitle,
      newJob.jobDescription,
      newJob.numberEmployeesNeeded,
      newJob.jobStatus,
      newJob.jobCategory,

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
    "UPDATE Recruiter SET jobPostedCount = jobPostedCount + 1 WHERE userId = ?",
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
var listJobSearched = function (jobTitle, callback) {
  db.query("SELECT * FROM jobs WHERE jobTitle = ?", [jobTitle], function (
    err,
    rows
  ) {
    if (err) return callback(err);
    return callback(null, rows);
  });
};

// List all jobs matching a specific userId
// callback(err, users)
var listMatchingJobs = function (userId, callback) {
  db.query("SELECT * FROM jobs WHERE employerId = ?", [userId], function (
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

var updateStatus = function (jobId, callback) {
  db.query(
    "UPDATE jobs SET status= 'Inactive' WHERE jobId=?",
    [jobId],
    callback
  );
};

exports.listJobSearched = listJobSearched;
exports.listMatchingJobs = listMatchingJobs;
exports.createJob = createJob;
exports.listJobs = listJobs;
exports.deleteJob = deleteJob;
exports.updateStatus = updateStatus;
