const User = require("../models/User");

exports.register = function(req, res){
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {userName: user.data.username, avatar: user.avatar}
        req.session.save(function(){
            res.redirect('/')
        })
    }).catch((regErrors) => {
        regErrors.forEach(function(error){
            req.flash('regErrors', error)
        })
        req.session.save(function(){
            res.redirect('/')
        })
    })
}

exports.loginPromise = function(req, res) {
    let user = new User(req.body)
    user.loginPromise().then(function(result) {
      req.session.user = {avatar: user.avatar, username: user.data.username}
      req.session.save(function() {
        res.redirect('/')
      })
    }).catch(function(e) {
      req.flash('errors', e)
      req.session.save(function() {
        res.redirect('/')
      })
    })
  }

exports.loginCallback = function(req, res){
    let user = new User(req.body)
    user.loginCallback(function(result){
        req.session.user = {favColor: "blue", username: user.data.username}
            if(result==true){
                res.redirect('/')
            } else {
                res.send("Invalid password or username")
            }
        })
    }

exports.logout = function(req, res){
    req.session.destroy(function(){
        res.redirect('/')
    })
}

exports.mustBeLoggedIn = function(req, res, next){
   if(req.session.user){
    next()
   } else{
    req.flash('errors', 'you must be logged in to perform that action')
    req.session.save(function() {
        res.redirect('/')
      })
   }
}

exports.home = function(req, res){
    if(req.session.user){
        console.log("dashboard?")
        res.render('home-dashboard')
    } else {
        console.log("guest?")
        res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')})}
    }