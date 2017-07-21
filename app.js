const express = require('express')
const morgan  = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const flash = require('connect-flash')
const Twit    = require('twit')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const crypto = require('crypto')
const models = require("./models/index")
const expressLayouts = require('express-ejs-layouts');


// env variables
const port = process.env.PORT || 3000;
const env  = process.env.NODE_ENV || "development";
const TWITTER_CONSUMER_KEY     = process.env.TWITTER_CONSUMER_KEY ;
const TWITTER_CONSUMER_SECRET  = process.env.TWITTER_CONSUMER_SECRET ;
const SESSION_SECRET           = process.env.SESSION_SECRET || "changeinproduction";

const requestLoggingFormat = env === "development" ? 'dev' : 'combined'
const app = express()
app.use(morgan(requestLoggingFormat))
app.use(express.static(__dirname + "/public"))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(session({ secret: SESSION_SECRET, cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false  }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.set('view engine', 'ejs');
app.use(expressLayouts)

passport.use(new LocalStrategy(
  (username, password, done) => {
    models.User.findOne({ where: { username: username } }).then((user) => {
      var errorMessage = "Incorrect username or password"
      if (!user) {
        return done(null, false, { message: errorMessage  })
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: errorMessage })
      }
      return done(null, user)
    }).catch( (err) => {
      console.log(err.stack)
      return done(null, false, { message: 'Something went wrong' })
    })
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  models.User.findById(id).then((user) => {
    done(null, user)
  })
})

var T = new Twit({
  app_only_auth:        true,
  consumer_key:         TWITTER_CONSUMER_KEY,
  consumer_secret:      TWITTER_CONSUMER_SECRET,
})

const authenticationMiddleware = (req, res, next) => {  
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

app.get("/", (req, res, next) => {
  res.render('index', { message: req.flash('error') })
})

app.get("/login", (req, res, next) => {
  res.render('login', { message: req.flash('error') })
})

app.post('/login', (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) { 
      return res.render('login', { message: "Invalid username or password", user: req.body }) 
    }
    req.logIn(user, (err) => {
      if (err) { return next(err) }
      return res.redirect('/dashboard')
    })
  })(req, res, next)
})

app.post('/signup', (req, res, next) => {
  var user = models.User.build({ 
    username: req.body.username, 
    email: req.body.email, 
    password: req.body.password, 
    createdAt: new Date(), 
    updatedAt: new Date() 
  })

  user.save().then((user) => {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.redirect('/login') }
      req.logIn(user, (err) => {
        if (err) { return next(err) }
        return res.redirect('/dashboard')
      })
    })(req, res, next)

  }).catch( (err) => {
    const message = err.errors.map((error) => {
      return error.message
    }).join("\n") 

    res.render('index', { message: message, user: user })
  })
})

app.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

app.get('/dashboard', authenticationMiddleware, (req, res, next) => {
  res.render('dashboard', { user: req.user })
})

app.get('/history', authenticationMiddleware, (req, res, next) => {
  models.History.findAll({ where: { user_id: req.user.id } }).then((histories) => {
    res.render('history', { histories: histories })
  })
})

app.get('/search', authenticationMiddleware, (req, res) => {
  const query = req.query.q + " since:2017-01-01"
  T.get('search/tweets', { q: query, count: 10 }, function(err, data, response) {

    models.History.create({ 
      user_id: req.user.id, 
      search: req.query.q, 
      result: JSON.stringify(data.statuses), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    }).then((history) => {
      const results = data.statuses.map((status) => {
        return { 
          username: status.user.screen_name, 
          thumbnail: status.user.profile_image_url, 
          text: status.text 
        }
      })

      res.send({results: results})
    })

  })
})

const server = app.listen(port, () => {
  console.log('Running server at port ' + server.address().port)
})


