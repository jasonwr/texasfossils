// app.js

// API's -
var express = require('express');
var http = require('http');
var https = require('https');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoConnector = require('connect-mongo')(session);
var debug = require('debug')('node:server');
var fs = require('fs');
var bodyParser = require('body-parser');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

// app object handle
var app = express();

// Setup dependency injection and list paths with ElectrolyteJS (Inversion of Control)
var ioc = require('electrolyte');
ioc.use(ioc.dir('models'));
ioc.use(ioc.dir('services'));
ioc.use(ioc.dir('controllers'));
ioc.use(ioc.dir('utils'));
ioc.use(ioc.dir('config'));
ioc.use(ioc.node_modules());

// create components (objects) from the Electrolyte IoC mechanism here:
var database = ioc.create('database');

// connect to the database:
database.connect(function (err) {
  if (err) {
    console.log("Unable to connect to the Mongo database! Make sure 'mongod' is running.");
    console.log(err);
    process.exit(-1);
  } else {
    console.log("Connected to Mongo database.");
  }
});

// database settings for app
app.use(session({
  store: new MongoConnector({
    mongooseConnection: database.getConnection(),
    // time to live:
    ttl: 3360
  }),
  secret: 'ChangeMe1',
  resave: true,
  saveUninitialized: true
}));

// Schemas
var user = require('./models/user.js');

// security
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// set routes up:
var routes = {
    index: require('./routes/index.js'),
    api: require('./routes/api.js')
};

// view engine setup and static files from file system (server)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));
app.use('/media', express.static('/media')); // images are stored here
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

// register the public directory with express.static for quick access from anywhere:
app.use(express.static(path.join(__dirname, 'public')));

// ExpressJS routing:
app.use('/', routes.index);
app.use('/api', routes.api);

// catch 404 and forward on to error handler:
app.use(function (res, req, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Create HTTP server. When web site is visited load app object.
var server = http.createServer(app);

// listen on provided port, on server IPv4
var PORT = 80;
var port = PORT;
var SERVER = '198.58.126.207';

// Can add a second middle param with the SERVER IPv4. Default is localhost.
server.listen(PORT, SERVER, function () {
    // callback:
    console.log("Server listening on PORT: %s and IPv4: %s", PORT, SERVER);
});
server.on('error', onError);
server.on('listening', onListening);


// normalize a port into a number, string, or false:
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

// error handler function
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function loadDefaultPage(socket) {
    fs.readFile('./public/templates/index.html', function (err, html) {
        if (err) {
            throw err;
        }
    });
}

// event listeners for HTTP server "listening" event
function onListening() {
    var addr = server.address();
    // unix (file) pipe (IPC) or network port:
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    loadDefaultPage(bind);
}
