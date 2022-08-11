const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')
const followController = require('./controllers/followController')


//user related routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.get('/about', function(req, res){
    res.send('this is our page')
})
router.post('/login', userController.loginPromise)
router.post('/logout', userController.logout)
router.post('/doesUsernameExist', userController.doesUsernameExist)
router.post('/doesEmailExist', userController.doesEmailExist)


//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.editScreen)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.deletePost)
router.post('/search', postController.search)

//profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.shareProfileData, userController.profilePostScreen)
router.get('/profile/:username/followers', userController.ifUserExists, userController.shareProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists, userController.shareProfileData, userController.profileFollowingScreen)

//follow related routes
router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow)
router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow)











module.exports = router