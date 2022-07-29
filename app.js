const express = require('express')
const mongoStore = require('connect-mongo')
const session = require('express-session')
const cookieParser = require("cookie-parser")
const flash = require('connect-flash')


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
    // make user session data available from within view templates
res.locals.user = req.session.user
console.log("pasa x aca")
console.log(res.locals.user)
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


