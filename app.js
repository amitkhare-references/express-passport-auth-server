const fs = require("fs");
const https = require("https");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
//const mongoose = require("mongoose");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportHttp = require("passport-http");
const express = require("express");

const app = express();

const server = https.createServer({
    cert: fs.readFileSync(__dirname + '/my.crt'),
    key: fs.readFileSync(__dirname + '/my.key')
},app);

// connect to mongoose
//mongoose.connect('mongodb://localhost/bookstore');
//const db = mongoose.connection;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded( {extended:false }));
app.use(cookieParser());
app.use(expressSession({
    secret:process.env.SESSION_SECRET || 'secretkey',
    resave: false,
    saveUninitialized:false
    
}));

app.use(passport.initialize());
app.use(passport.session());


function verifyCredentials(username, password, done) {
    // use real database
    if(username === password){
        done(null,{id:123,name:username,gender:'male'});
    } else {
        done(null,null);
    }
    // when error
    //done(new Error('ouch!'));

}

passport.use(new passportLocal.Strategy(verifyCredentials));

passport.use(new passportHttp.BasicStrategy(verifyCredentials));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});


passport.deserializeUser(function (id, done) {
    //query db here by ID.
    var dbUser = {id:123,name:"Amit",gender:'male'};
    
    done(null, dbUser);
});

// for http auth
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        next();
    } else {
        res.send(403);
    }
}

app.get("/",function (req, res) {
    res.render("index",{
        isAuthenticated:req.isAuthenticated(),
        user: req.user
    });
});


app.get("/login",function (req, res) {
    res.render("login");
});

app.post("/login", passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

app.get("/logout",function (req, res) {
    req.logout();
    res.redirect('/');
});

// use basic auth for all api
app.use("/api",passport.authenticate('basic',{ session:false }));

app.get("/api/data",ensureAuthenticated, function (req, res) {
    res.json([
        {value:'foo'},
        {value:'bar'},
        {value:'baz'}
    ]);
});

var port = process.env.PORT || 8080;

// with https
server.listen(port, function () {
    console.log("https running on *:"+port);
});

// without https
//app.listen(port, function () {
//    console.log("running on *:"+port);
//});

// openssl req -x509 -nodes -days 365 -newkey rsa:1024 -out my.crt -keyout my.key