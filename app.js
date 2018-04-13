var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var config = require('./config.js')
var authenticate = require('./components/oauth/authenticate')
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

if (config.seedDB) { require('./components/oauth/seed'); }
if (config.seedMongoDB) { require('./components/oauth/seed-mongo'); }

/** Public Area **/

require('./components/oauth')(app)

/** Control Private through OAuth **/

app.use('/', routes);
app.use('/users', users);

app.get('/secure', authenticate(), function(req,res){
  res.json({message: 'Secure data'})
});

app.get('/tes', function(req, res){
  request({
    url: 'http://api.samarindakota.go.id/api/v1/penduduk',
    auth: {
      'bearer': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNiMjFmNDA0MDM2ZjRhNGYzNzBkNGRlOTg0MDQ5NWUxYTMxMzAwYmIzODc2ZmM2NWFiYTEyYWFkYTdmMzFlMzk3NjkxMDA4NDNiMTU0Mjc1In0.eyJhdWQiOiIzIiwianRpIjoiM2IyMWY0MDQwMzZmNGE0ZjM3MGQ0ZGU5ODQwNDk1ZTFhMzEzMDBiYjM4NzZmYzY1YWJhMTJhYWRhN2YzMWUzOTc2OTEwMDg0M2IxNTQyNzUiLCJpYXQiOjE1MDkxMDkyMjIsIm5iZiI6MTUwOTEwOTIyMiwiZXhwIjoxNTQwNjQ1MjIyLCJzdWIiOiIxMiIsInNjb3BlcyI6WyJQZW5kdWR1ayIsIlByb3ZpbnNpIiwiS290YSIsIktlY2FtYXRhbiIsIktlbHVyYWhhbiJdfQ.DVNPUBD3prTxYiFQQzhvG6tJEDqSwwhWNM9OOZcmZKm7s1MDTHY5_ReRo3F8RqnZHtOB5W6ntZXQLr6jQrWKlfN9VvwKr4LtJxmloUYzIf7GbB_V0Fi0UEXHh5hps_BwfQ5Mh3aoxPQQDPE2e7lZnMaZdKWkcQVyYCRtWg667OwBxuDYK4gGvxTGvn_CaWNtBSMCGj_75uZq27egJGdPZfyCTa7OZdwW_uvxudHMW2RGFhImYmlV976wGmLZ90y8g-VKPm7i5sGKhNrPVWTOedt5OBisz57IUcPuGbeCJS8tv_YvUPmY9BTCfBUYXxrjDDfBa0pkqyaW2qY0yj1GE1pVIIohpaLHpo_us0F1alBZUNVfa8dDoMbsGe27zfkl3rHSREtvVz_DcmnPBqAmug3i2fNqYVYy6HfAKshKQtkglvG3Lm0vdhnsPVS07uSRS7WwfH6vnSX18yXLv-OmhImMIAwiIHd9LwAIJDD_Q_U1Q9uZgyOObOVTrrSume-xuAT90o77bUUZSSPV9KBfJsgekS_gt0OKp6RrdhEKqwAlJjSP_9l4voAoWoKtCInWONnG7TF7OILJdpd8yw2fbapdhJawx9iTboWBtNQnrI3b-xEih2OrhSQt3Ky9Ukwnim7Y-NK3UkdJP0BrQVIAp9dsKcI7q2JO21YpvfPN9Dc'
    },
    json: true
  }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body)
    }
  })
});

app.get('/me', authenticate(), function(req,res){
  res.json({
    me: req.user,
    messsage: 'Authorization success, Without Scopes, Try accessing /profile with `profile` scope',
    description: 'Try postman https://www.getpostman.com/collections/37afd82600127fbeef28',
    more: 'pass `profile` scope while Authorize'
  })
});

app.get('/profile', authenticate({scope:'profile'}), function(req,res){
  res.json({
    profile: req.user
  })
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
