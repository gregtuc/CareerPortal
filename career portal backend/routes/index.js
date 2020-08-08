var user = require("../models/user");
var recruiter = require("../models/recruiter");
var jobseeker = require("../models/jobseeker");
var job = require("../models/job");
var auth = require("../utils/auth");
var applications = require("../models/applications");
const { application } = require("express");


// Main routes for app
module.exports = function (app) {
  app.get("/", function (req, res, next) {
    res.render("index");
  });

  //Endpoint for accessing profile. It will route you to recrutierprofile.hbs or userprofile.hbs
  //automatically by checking the appropriate tables for your identity.
  app.get("/profile", auth.requireLogin, function (req, res, next) {
    //If user is found in the recruiters table, render the recruiters profile page.
    recruiter.listMatchingRecruiters(req.user.userId, function (err, rows) {
      if (rows.length) {
        //Get all of a recruiters jobs and send them as well.
        job.listMatchingJobs(req.user.userId, function (err, jobrows) {
          var jobs = [];
          if (!err) {
            jobrows.forEach(function (row) {
              jobs.push({
                jobId: row.jobId,
                userId: row.userId,
                jobTitle: row.jobTitle,
                description: row.description,
                numberEmployeesNeeded: row.numberEmployeesNeeded,
                datePosted: row.datePosted,
                status: row.status,
              });
            });
          }
          res.render("recruiterprofile", {
            user: req.user,
            recruiter: rows[0],
            jobs: jobs,
          });
        });
        //res.render("recruiterprofile", { user: req.user, recruiter: rows[0] });
      } else {
        //If user not found in recruiters table, render the users profile page.
        jobseeker.listMatchingJobseeker(req.user.userId, function (
          err,
          userRows
        ) {
          //Check if user is a PrimeUser
          jobseeker.listMatchingPrimeUser(req.user.userId, function (
            err,
            rows
          ) {
            if (rows.length) {
              res.render("userprofileprime", {
                user: req.user,
                jobseeker: userRows[0],
                prime: rows[0],
              });
            } else {
              //if not a prime user,check if user is a GoldUser
              jobseeker.listMatchingGoldUser(req.user.userId, function (
                err,
                rows
              ) {
                if (rows.length) {
                  res.render("userprofilegold", {
                    user: req.user,
                    jobseeker: userRows[0],
                    gold: rows[0],
                  });
                } else {
                  //If not a gold and prime user, render basic user profile
                  res.render("userprofile", {
                    user: req.user,
                    jobseeker: userRows[0],
                  });
                }
              });
            }
          });
        });
      }
    });
  });

  //Endpoint for creating a new job posting.
  //TODO: Create a provision in job.createJob that verifies that the user has not exceeded
  //their quota depending on their membership, and rejects them if they have.
  app.post("/createjob", auth.requireLogin, function (req, res, next) {
    job.createJob(
      req.user.userId,
      req.body.jobTitle,
      req.body.jobDescription,
      req.body.numberEmployeesNeeded,
      function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/profile");
        }
      }
    );
  });

  app.post("/searchJob", auth.requireLogin, function (req, res, next) {
    job.listJobSearched(req.body.jobTitle, function (err, rows) {
      var jobs = [];
      if (!err) {
        rows.forEach(function (row) {
          jobs.push({
            jobId: row.jobId,
            userId: row.userId,
            jobTitle: row.jobTitle,
            description: row.description,
            numberEmployeesNeed: row.numberEmployeesNeeded,
            datePosted: row.datePosted,
            status: row.status,
          });
        });
      }
      res.render("jobfeed", { user: req.user, jobs: jobs });
    });
  });

  //Endpoint for getting all jobs that the active user has posted, and return it as an object
  //for the page.
  app.post("/getAllJobs", auth.requireLogin, function (req, res, next) {
    job.listJobs(function (err, rows) {
      var jobs = [];
      if (!err) {
        console.log(rows);
        rows.forEach(function (row) {
          jobs.push({
            jobId: row.jobId,
            userId: row.userId,
            jobTitle: row.jobTitle,
            description: row.description,
            numberEmployeesNeeded: row.numberEmployeesNeeded,
            datePosted: row.datePosted,
            status: row.status,
          });
        });
      }
      res.render("explorepage", { user: req.user, jobs: jobs });
    });
  });

  //Endpoint for getting all jobs that the active user has posted, and return it as an object
  //for the page.
  app.post("/getJobs", auth.requireLogin, function (req, res, next) {
    user.listMatchingJobs(userId, function (err, rows) {
      var jobs = [];
      if (!err) {
        rows.forEach(function (row) {
          jobs.push({
            jobId: row.jobId,
            userId: row.userId,
            jobTitle: row.jobTitle,
            description: row.description,
            numberEmployeesNeeded: row.numberEmployeesNeeded,
            datePosted: row.datePosted,
            status: row.status,
          });
        });
      }
      res.render("recruiterprofile", { user: req.user, jobs: jobs });
    });
  });

  app.get("/admin", auth.requireLogin,  function (
    req,
    res,
    next
  ) {
    user.listUsers(function (err, rows) {
      var users = [];
      if (!err) {
        rows.forEach(function (row) {
          users.push({ userId: row.userId, email: row.email });
        });
      }
      res.render("admin", { user: req.user, users: users });
    });
  });

  app.get("/action/delete/:userId", auth.requireLogin,  function (
    req,
    res,
    next
  ) {

    if (req.user.userId === req.params.userId) {
      // If the user is trying to delete their own account, log them out first
      req.logout();
    }

    user.deleteUser(req.params.userId, function (err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin");
    });
  });


  app.get("/action/promote/:userId", auth.requireLogin,  function (
      req,
      res,
      next
  ) {

    user.promoteUser(req.params.userId, function (err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin");
    });
  });

  app.get("/action/demote/:userId", auth.requireLogin,  function (
      req,
      res,
      next
  ) {

    user.demoteUser(req.params.userId, function (err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin");
    });
  });


  app.get("/action/lock/:userId", auth.requireLogin,  function (
      req,
      res,
      next
  ) {

    user.lock(req.params.userId, function (err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin");
    });
  });

  app.get("/action/unlock/:userId", auth.requireLogin,  function (
      req,
      res,
      next
  ) {

    user.unlock(req.params.userId, function (err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin");
    });
  });


  app.post("/createApplication", auth.requireLogin, function (req, res, next) {
    applications.createApplication(
      req.user.userId,
      req.body.title,
      req.body.body,
      function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/profile");
        }
      }
    );
  });


};
