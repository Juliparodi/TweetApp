const { ObjectId } = require('mongodb')

const usersCollection = require('../db').db().collection("users")
const followsCollection = require('../db').db().collection("follows")

const User = require('./User')

let Follow = function(followedUserName, authorId){
    this.followedUserName = followedUserName,
    this.authorId = authorId
    this.errors = []
}

Follow.prototype.cleanUp = function(){
    if(typeof(this.followedUserName) != "string"){this.data.username = ""}
}

Follow.prototype.validate = async function(action){
    //followedUserName must exist in the DB
    let followedAccount = await usersCollection.findOne({username: this.followedUserName})
    if(followedAccount){
        this.followedId = followedAccount._id
    } else{
        this.errors.push('you cannot follow a user that does not exist')
    }

    let doesFollowAlreadyExist = await followsCollection.findOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)})
    if(action == 'create'){
        if(doesFollowAlreadyExist) {
            this.errors.push("you are already following this user")
        }
    }

    if(action == 'delete'){
        if(!doesFollowAlreadyExist) {
            this.errors.push("you are not following this user")
        }
    }

      //user should not be able to follow itself
      if(this.followedId == this.authorId){
        this.errors.push("you cannot follow yourself")
    }
}

Follow.prototype.create = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate('create')
        if(!this.errors.length){
           await followsCollection.insertOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)})
           resolve()
        } else(
            reject(this.errors)
        )
    })
}

Follow.prototype.delete = function(){
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate('delete')
        if(!this.errors.length){
           await followsCollection.deleteOne({followedId: this.followedId, authorId: new ObjectId(this.authorId)})
           resolve()
        } else(
            reject(this.errors)
        )
    })
}

Follow.isVisitorFollowing = async function(followedUserId, visitorId){
    let followDoc = await followsCollection.findOne({followedId: followedUserId, authorId: new ObjectId(visitorId)})
    if(followDoc){
        return true
    } else{
        return false
    }
}

Follow.getFollowersById = function(userId){
    return new Promise(async (resolve, reject) => {
        try{
            let followers = await followsCollection.aggregate([
                {$match: {followedId: userId}},
                {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ['$userDoc.username', 0]},
                    email: {$arrayElemAt: ['$userDoc.email', 0]}
                }}
            ]).toArray()
            followers = followers.map(function(follower){
                //create a user
                let user = new User(follower, true)
                return {username: follower.username, avatar: user.avatar}
            })
            resolve(followers)
        } catch{
            reject()
        }
    })
}

Follow.getFollowingsById = function(userId){
    return new Promise(async (resolve, reject) => {
        try{
            let followers = await followsCollection.aggregate([
                {$match: {authorId: userId}},
                {$lookup: {from: "users", localField: "followedId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ['$userDoc.username', 0]},
                    email: {$arrayElemAt: ['$userDoc.email', 0]}
                }}
            ]).toArray()
            followers = followers.map(function(follower){
                //create a user
                let user = new User(follower, true)
                return {username: follower.username, avatar: user.avatar}
            })
            resolve(followers)
        } catch{
            reject()
        }
    })
}

Follow.countFollowersById = function(id){
    return new Promise(async (resolve, reject) => {
        try{
            let followerCount = await followsCollection.countDocuments({followedId: id})
            resolve(followerCount)
        } 
        catch {
             reject()
         }
    })
}

Follow.countFollowingById = function(id){
    return new Promise(async (resolve, reject) => {
        try{
            let followingCount = await followsCollection.countDocuments({authorId: id})
            resolve(followingCount)
        } 
        catch {
            reject()
        }
    })
 }

module.exports = Follow