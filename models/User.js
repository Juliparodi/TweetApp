const validator = require("validator")
const usersCollection = require('../db').collection("users")

let User = function(data){
    this.data = data
    this.errors = []
}

User.prototype.register = function(){
    this.cleanUp()
    this.validate()

    if(!this.errors.length){
        usersCollection.insertOne(this.data)
    }

}

User.prototype.login = function(callback){
    this.cleanUp()
    inputData = this.data
    usersCollection.findOne({username: this.data.username}, function(err, attemptedUser){
        if(attemptedUser && inputData.password == attemptedUser.password){
            callback("congratss!! " + attemptedUser.username)
        } else{
            callback("invalid user and password")
        }
    })
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != "string"){this.data.username = ""}
    if(typeof(this.data.email) != "string"){this.data.email = ""}

    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.validate = function(){
    if(this.data.username == null || this.data.username == "") {this.errors.push("you must provide a username")}
    if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("username can only contains letters")}
    if(!validator.isEmail(this.data.email)) {this.errors.push("you must provide an email")}
    if(this.data.password == null || this.data.password == "") {this.errors.push("you must provide a password")}
    if(this.data.password.length  < 0 && this.data.password.length  > 12) {this.errors.push("password is incorrect")}

}

module.exports = User