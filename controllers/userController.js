const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const jwt = require("jsonwebtoken")

exports.register = function(req, res){
    let user = new User(req.body)
    user.register().then(() => {
        req.session.user = {userName: user.data.username, avatar: user.avatar, _id: user.data._id}
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
      req.session.user = {avatar: user.avatar, username: user.data.username, _id: user.data._id}
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

exports.home = async function(req, res){
    if(req.session.user){
        //fetch feed of posts for current user 
        let posts = await Post.getFeed(req.session.user._id)
        res.render('home-dashboard', {posts: posts, user: req.session.user})
    } else {
        res.render('home-guest', {regErrors: req.flash('regErrors')})}
    }

 exports.ifUserExists = function(req, res, next) {
     User.findByUserName(req.params.username).then(function(userDocument) {
        req.profileUser = userDocument
        next()
    }).catch(function() {
        res.render("404")
    })
    }

exports.profilePostScreen = function(req, res){
//ask our post model for posts by certain author id
    Post.findByAuthorId(req.profileUser._id).then(function(posts){
        res.render('profile', {
            title: `profile for ${req.profileUser.username}`,
            currentPage: "posts",
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount} 
        })
    }).catch(function(){
        res.render('404')
    })
}

exports.shareProfileData = async function(req, res, next){
    let isVisitorsProfile = false
    let isFollowing = false
    if(req.session.user){
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId)
    }

    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing

    //retrieve posts, follower and following counts
    let postsCountPromise =  Post.countPostsByAuthor(req.profileUser._id)
    let followerCountPromise =  Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise =  Follow.countFollowingById(req.profileUser._id)

    let [postCount, followerCount, followingCount] = await Promise.all([postsCountPromise, followerCountPromise, followingCountPromise])

    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount
    
    next()
}

exports.profileFollowersScreen = async function(req,res){
    try{
        let followers = await Follow.getFollowersById(req.profileUser._id)
        res.render('profile-followers', {
            currentPage: "followers",
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount} 
        })
    } catch{
        res.render('404')
    }
}

exports.profileFollowingScreen = async function(req,res){
    try{
        let following = await Follow.getFollowingsById(req.profileUser._id)
        res.render('profile-following', {
            currentPage: "following",
            following: following,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount} 
        })
    } catch{
        res.render('404')
    }
}

exports.doesUsernameExist = async function(req, res){
    try{
        User.findByUserName(req.body.username).then(() => {
            res.json(true)
        }).catch(() => {
            res.json(false)
        })
    } catch{
        res.render('404')
    }
}

exports.doesEmailExist = async function(req, res){
    try{
        let emailBool = await User.doesEmailExist(req.body.email)
        res.json(emailBool)
    } catch{
        res.render('404')
    }
}

exports.apiLogin = function(req, res) {
    let user = new User(req.body)
    user.loginPromise().then(function(result) {
        res.json("Hey! U just successfully login in the amazing Juli App")
    }).catch(function(e) {
        res.json("sorry ur values are not correct")
    }
    )}