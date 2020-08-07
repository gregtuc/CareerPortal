var user = require("../models/user");
var recruiter = require("../models/recruiter");
var jobseeker =  require("../models/jobseeker");
var auth = require("../utils/auth");

// Main routes for app
module.exports = function (app) {
  app.get("/", function (req, res, next) {
    res.render("index");
  });

  app.get("/profile", auth.requireLogin, function (req, res, next) {
    //If user is found in the recruiters table, render the recruiters profile page.
    recruiter.listMatchingRecruiters(req.user.userId, function (err, rows) {
      if (rows.length) {
        res.render("recruiterprofile", { user: req.user, recruiter: rows[0] });
      } else {
        //If user not found in recruiters table, render the users profile page.
        res.render("userprofile", { user: req.user, jobseeker: rows[0] });
      }
    });
  });

  app.get("/admin", auth.requireLogin, auth.requireAdmin, function (
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

  app.get("/delete/user/:id", auth.requireLogin, auth.requireAdmin, function (
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
};
