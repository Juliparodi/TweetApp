const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')
const postController = require('./controllers/postController')


router.get('/', userController.home)
router.post('/register', userController.register)


router.get('/about', function(req, res){
    res.send('this is our page')
})

//router.post('/create-post', postController.create)
router.post('/login', userController.loginPromise)

router.post('/logout', userController.logout)

router.get('/create-post', userController.mustBeLoggedIn, postController.viewCreateScreen)




module.exports = router