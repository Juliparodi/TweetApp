const validator = require("validator")
const usersCollection = require('../db').db().collection("users")
const bcrypt = require('bcryptjs')
const md5 = require('md5')

let User = function(data, getAvatar){
    this.data = data
    this.errors = []
    if(getAvatar==undefined){getAvatar = false}
    if(getAvatar){this.getAvatar()}
}

User.prototype.register = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()
    
        if(!this.errors.length){
            //hash user password
            let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password, salt)
            await usersCollection.insertOne(this.data)
            this.getAvatar()
            resolve()
        } else{
            reject(this.errors)
        }
    })
}

User.prototype.loginCallback = function(callback){
    this.cleanUp()
    inputData = this.data
    usersCollection.findOne({username: this.data.username}, function(err, attemptedUser){
        if(attemptedUser && bcrypt.compareSync(inputData.password, attemptedUser.password)){
            callback(true)
        } else{
            callback(false)
        }
    })
}

User.prototype.loginPromise = function() {
    return new Promise((resolve, reject) => {
      this.cleanUp()
      usersCollection.findOne({username: this.data.username}).then((attemptedUser) => {
        if (attemptedUser && bcrypt.compareSync(this.data.password, attemptedUser.password)) {
          this.data = attemptedUser
          this.getAvatar()
          resolve("Congrats!")
        } else {
          reject("Invalid username / password.")
        }
      }).catch(function() {
        reject("Please try again later.")
      })
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
    return new Promise(async (resolve, reject) => {
        if(this.data.username == null || this.data.username == "") {this.errors.push("you must provide a username")}
        if(this.data.username != "" && !validator.isAlphanumeric(this.data.username)) {this.errors.push("username can only contains letters")}
        if(!validator.isEmail(this.data.email)) {this.errors.push("you must provide an email")}
        if(this.data.password == null || this.data.password == "") {this.errors.push("you must provide a password")}
        if(this.data.password.length  < 0 && this.data.password.length  > 12) {this.errors.push("password is incorrect")}
    
        //only if username is valid then check if it's already taken
        if(this.data.username.length > 2 
            && this.data.username.length < 31 
            && validator.isAlphanumeric(this.data.username)){
                let userNameExists = await usersCollection.findOne({username: this.data.username})
                if(userNameExists){
                    this.errors.push('that username is already taken')
                }
            }
    
            //only if email is valid then check if it's already taken
        if(validator.isEmail(this.data.email)){
                let emailExists = await usersCollection.findOne({email: this.data.email})
                if(emailExists){
                    this.errors.push('that email is already taken')
                }
            }
        resolve()
    })
}

User.prototype.getAvatar = function(){
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUserName = function(username){
return new Promise(function(resolve, reject) {
    if(typeof(username) != "string"){
        reject()
        return
    }
    usersCollection.findOne({username: username}).then(function(user){
        if (user) {
            user = new User(user, true)
            user = {
                _id: user.data._id,
                username: user.data.username,
                avatar: user.avatar
            }
            resolve(user)
        } else{
            reject()
        }
    }).catch(function(error){
        reject()
    })
})
}

module.exports = User