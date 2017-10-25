const express = require("express");
const app = express();
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");

const passport = require("passport");
const passportLocal = require("passport-local");
const passportHttp = require("passport-http");

// connect to mongoose
mongoose.connect('mongodb://localhost/bookstore');
const db = mongoose.connection;

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

passport.use(new passportLocal.Strategy(function(username, password, done){
    // use real database
    if(username === password){
        done(null,{id:123,name:username,gender:'male'});
    } else {
        done(null,null);
    }
    // when error
    //done(new Error('ouch!'));
    
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    //query db here by ID.
    var dbUser = {id:123,name:"Amit",gender:'male'};
    
    done(null, dbUser);
});

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

app.get("/register",function (req, res) {
    res.render("register");
});

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log("running on *:"+port);
});