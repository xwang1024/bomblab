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
const qiniu      = require('qiniu');
const busboy     = require('connect-busboy'); // 文件上传支持
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
                     require('body-parser-xml')(bodyParser);

const config = require('./lib/config');

const app = express();
app.config = config;

const Mongo  = require('./lib/service/Mongo');
Mongo.getClient(config.mongodb).then((mongoClient) => {
  app.db = mongoClient;
  require('./lib/model')(app, mongoose);

  const route = require('./lib/route')();
  const initPassport = require('./lib/passport');
  const Wechat = require('./lib/service/Wechat');
  const Cache  = require('./lib/service/Cache');
  const Xiumi = require('./lib/service/Xiumi');

  Cache.init(config.redis);
  Wechat.init(config.wechat);
  Xiumi.init(config.xiumi);
  qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
  qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

  var hbs = exphbs.create({
    extname: ".hbs",
    defaultLayout: 'default',
    helpers: require('./lib/hbs_helpers')
  });
  app.engine('hbs', hbs.engine);
  app.set('view engine', 'hbs');

  morgan.token('username', (req) => (req.user ? req.user.username : 'unknown') );
  app.use(morgan(':remote-addr :username :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
    skip: (req, res) => { return /(.*\.css$)|(.*\.js$)|(.*\.ico$)|(.*\.png$)|(.*\.woff$)|(.*\.woff2$)/.test(req.path); }
  }));

  app.use(bodyParser.json({limit: '10mb'}));
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
    res.status(404);
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
});

module.exports = app;
