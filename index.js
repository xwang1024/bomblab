'use strict';

require('./lib/polyfill');

const path       = require('path');
const express    = require('express');
const exphbs     = require('express-handlebars');
const session    = require('express-session');
const mongoStore = require('connect-mongo')(session);
const morgan     = require('morgan');
const passport   = require('passport');
const mongoose   = require('mongoose');
const busboy     = require('connect-busboy');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
                     require('body-parser-xml')(bodyParser);

const route = require('./lib/route')();
const initPassport = require('./lib/passport');
const config = require('./lib/config');
const Wechat = require('./lib/service/Wechat');
const Cache  = require('./lib/service/Cache');

const app = express();
app.config = config;

// init mongodb connection
mongoose.Promise = global.Promise;
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () { /* ... */ });
require('./lib/model')(app, mongoose);

Cache.init(config.redis);
Wechat.init(config.wechat);

// view engine setup
var hbs = exphbs.create({
  extname: ".hbs",
  defaultLayout: 'main',
  helpers: require('./lib/hbs_helpers')
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

morgan.token('username', (req) => (req.user ? req.user.username : 'unknown') );
app.use(morgan(':remote-addr :username :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
  skip: (req, res) => { return /(.*\.css$)|(.*\.js$)|(.*\.ico$)|(.*\.png$)|(.*\.woff$)|(.*\.woff2$)/.test(req.path); }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.xml());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.cryptoKey,
  store: new mongoStore({ url: config.mongodb.uri })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(busboy());

initPassport(app, passport);

app.use('/', route);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('error/404', {
    layout: 'single',
    message: err.message,
    error: {}
  });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500);
  res.render('error/500', {
    layout: 'single',
    message: err.message,
    stackInfo: err.stack
  });
});

module.exports = app;
