const User = require("../models/User");

exports.home = function(req, res){
    console.log("redirecting to home...");
    res.render('home-guest')
}

exports.register = function(req, res){
    let user = new User(req.body)
    user.register()
    if(user.errors.length){
        res.send(user.errors)
    } else{
        res.send("You have been registered succesfully")
    }
}

exports.login = function(req, res){
    let user = new User(req.body)
    user.login(function(result){
        res.send(result)
    })
}

exports.logout = function(req, res){
    console.log("redirecting to home...");
    res.render('home-guest')
}