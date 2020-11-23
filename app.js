const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const methodOverride = require('method-override')
 
require('./config/db')();
require('./config/passport')(passport);
dotenv.config({ path: './config/config.env'})

const app = express()

// body parser 
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// method overide
app.use(methodOverride(function(req,res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))


const { formatDate, stripTags,  truncate, editIcon, select} = require('./helpers/hbs')


// handlebars
app.engine('.hbs', 
exphbs({ helpers:{formatDate, stripTags,  truncate, editIcon, select}, 
    defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

// Sessions
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store : new MongoStore({
            mongooseConnection: mongoose.connection
        })
    })
)


// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global variable
app.use(function(req,res, next) {
    res.locals.user = req.user || null
    next();
})


// static folder
app.use(express.static(path.join(__dirname, 'public')))
// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`))