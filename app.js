var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var atsdClient = require('./utils/client');
var METHOD = atsdClient.httpClient.METHOD;
var atsdUrl = require('./utils/client').options.url;

var index = require('./routes/index');
var configurationRoute = require('./routes/configuration');
var widgetRoute = require('./routes/widget');
var statisticRoute = require('./routes/statistic');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', index);
app.use('/configuration', configurationRoute);
app.use('/widget', widgetRoute);
app.use('/statistic', statisticRoute);


app.use('/api/', function (req, res) {
    if (req.body == null) {
        atsdClient.request(req.url, req.method).pipe(res);
    } else {
        atsdClient.request(req.url, req.method, req.body).pipe(res);
    }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// error handler


module.exports = app;
