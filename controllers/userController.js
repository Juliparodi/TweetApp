exports.home = function(req, res){
    console.log("redirecting to home...");
    res.render('home-guest')
}

exports.register = function(req, res){
    res.send('thanks for being interested in register, we are not registering for the moment')
}

exports.login = function(req, res){
    console.log("redirecting to home...");
    res.render('home-guest')
}

exports.logout = function(req, res){
    console.log("redirecting to home...");
    res.render('home-guest')
}