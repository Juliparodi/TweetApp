const Follow = require("../models/Follow");

exports.addFollow = function (req, res) {
  let follow = new Follow(req.params.username, req.visitorId);
  follow
    .create().then(function () {
      req.flash("success", `successfully followed ${req.params.username}`);
      req.session.save(function () {
        res.redirect(`/profile/${req.params.username}`);
      });
    }) .catch(function (errors) {
      errors.forEach((error) => {
        req.flash("errors", error);
      });
      req.session.save(function () {
        res.redirect("/");
      });
    });
}

exports.removeFollow = function (req, res) {
    let follow = new Follow(req.params.username, req.visitorId);
    follow.delete().then(function () {
        req.flash("success", `successfully stoped following ${req.params.username}`);
        req.session.save(function () {
          res.redirect(`/profile/${req.params.username}`);
        });
      }) .catch(function (errors) {
        errors.forEach((error) => {
          req.flash("errors", error);
        });
        req.session.save(function () {
          res.redirect("/");
        });
      });
  }
