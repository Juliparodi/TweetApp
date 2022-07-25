const express = require('express')
const router = require('./router')

const app = express()

app.use(express.urlencoded({encoded:false}))
app.use(express.json())
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app


//app.get('/', function(req, res){
  //  res.render('home-guest')})


