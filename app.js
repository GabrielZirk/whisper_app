require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//----------------------------MongoDB/Mongoose setup
mongoose.connect("mongodb://localhost:27017/userDBSecrets");

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: [String]
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//----------------------------GET REQUESTS
app.get("/", (req, res) => {
    res.render('home');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.get("/secrets", (req, res) => {
    User.find({secret: {$ne: null}}, (err, docs) => {
        if(err) {
            console.log(err);
        }
        else {
            var secret = [];
            docs.forEach(ele => secret.push(ele.secret));
            res.render("secrets", {secret : secret.flat()})
        }
    })
})

app.get("/login", (req, res) => {
    res.render('login');
});

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit");
    }
    else {
        res.redirect('/login')
    }
})

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    });
});

//----------------------------POST REQUESTS
app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register');
        }
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            })
        };
    });
});

app.post("/login", (req, res) => {
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(newUser, (err) => {
        if (err) {
            console.log(err);
        }
        else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
            })
        }
    })
});

app.post('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        User.updateOne({
            _id: req.user._id
        },
            {
                $push: {
                    secret: [req.body.secret]
                }
            }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        res.redirect('/secrets');
    }
    else {
        res.redirect('/login');
    }
})


app.listen("3000", (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server is running on port 3000.")
    }
});