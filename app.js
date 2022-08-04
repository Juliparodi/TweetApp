const express = require('express')
const mongoStore = require('connect-mongo')
const session = require('express-session')
const cookieParser = require("cookie-parser")
const flash = require('connect-flash')
const mark = require('marked')
const sanitizeHTML = require('sanitize-html')



const app = express()

let sessionOptions = session({
  secret: "Love Javascript and Java",
  store: mongoStore.create({client: require('./db')}),
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24, httpOnly: true}
})

app.use(sessionOptions)
app.use(flash())
app.use(cookieParser());

app.use(function(req, res, next){
  //make our mark down function available within view templates
  res.locals.filterUserHtml = function(content){
    return sanitizeHTML(mark.parse(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold'], allowedAttributes: {}})
  }

  //make all error and success messages available in all templates
  res.locals.errors = req.flash('errors')
  res.locals.success = req.flash('success')

  //make current user id available on the req object
  if(req.session.user){
    req.visitorId = req.session.user._id
  } else{
    req.visitorId = 0
  }

  // make user session data available from within view templates
res.locals.user = req.session.user
next()
})

const router = require('./router')

app.use(express.urlencoded({encoded:false}))
app.use(express.json())
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'ejs')

app.use('/', router)

module.exports = app


//app.get('/', function(req, res){
  //  res.render('home-guest')})


