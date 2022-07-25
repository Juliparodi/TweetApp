const express = require('express')
const router = express.Router()
const userController = require('./controllers/userController')

router.get('/', userController.home)
router.post('/register', userController.register)


router.get('/about', function(req, res){
    res.send('this is our page')
})

//router.post('/create-post', postController.create)
router.post('/login', userController.login)


module.exports = router