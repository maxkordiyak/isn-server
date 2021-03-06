'use strict';

var loopback = require('loopback');
var express = require('express');
var boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var router = express.Router();
var session = require('express-session');

var app = module.exports = loopback();

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true
}));

app.middleware('auth', loopback.token({
  model: app.models.AccessToken,
}));
app.middleware('session:before', cookieParser(app.get('cookieSecret')));
app.middleware('session', session({
  secret: 'kitty',
  saveUninitialized: true,
  resave: true
}));

app.use(loopback.token());
app.use(function (req, res, next) {
  if ( ! req.accessToken) return next();
  app.models.Account.findById(req.accessToken.userId, function(err, user) {
    if (err) return next(err);
    if ( ! user) return next(new Error('No user with this access token was found.'));
    req.user = user;
    next();
  });
});


app.get('/current-user', function(req, res, next) {
  const user = req.user;
  res.json(user);
});

app.start = function() {
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
