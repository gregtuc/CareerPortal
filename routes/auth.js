var auth = require("../utils/auth");

// Routes for authentication (signup, login, logout)
module.exports = function (app, passport) {
  app.get("/usersignup", auth.alreadyLoggedIn, function (req, res, next) {
    res.render("usersignup", { message: req.flash("signupMessage") });
  });

  app.get("/recruitersignup", auth.alreadyLoggedIn, function (req, res, next) {
    res.render("recruitersignup", { message: req.flash("signupMessage") });
  });

  app.post(
    "/usersignup",
    passport.authenticate("local-jobseeker-signup", {
      successRedirect: "/profile",
      failureRedirect: "/usersignup",
      failureFlash: true, // Allow flash messages
    })
  );

  app.post(
    "/recruitersignup",
    passport.authenticate("local-recruiter-signup", {
      successRedirect: "/profile",
      failureRedirect: "/recruitersignup",
      failureFlash: true, // Allow flash messages
    })
  );

  app.get("/login", auth.alreadyLoggedIn, function (req, res, next) {
    res.render("login", { message: req.flash("loginMessage") });
  });

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/profile",
      failureRedirect: "/login",
      failureFlash: true, // Allow flash messages
    })
  );
  app.get("/logout", function (req, res, next) {
    req.logout();
    res.redirect("/");
  });
};
