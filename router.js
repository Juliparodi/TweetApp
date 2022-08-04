const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')

//use related routes
router.get('/', userController.home)
router.post('/register', userController.register)
router.get('/about', function(req, res){
    res.send('this is our page')
})
router.post('/login', userController.loginPromise)
router.post('/logout', userController.logout)

//post related routes
router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post('/create-post', userController.mustBeLoggedIn, postController.create)
router.get('/post/:id', postController.viewSingle)
router.get('/post/:id/edit', userController.mustBeLoggedIn, postController.viewEditScreen)
router.post('/post/:id/edit', userController.mustBeLoggedIn, postController.editScreen)
router.post('/post/:id/delete', userController.mustBeLoggedIn, postController.deletePost)




//profile related routes
router.get('/profile/:username', userController.ifUserExists, userController.profilePostScreen)









module.exports = router