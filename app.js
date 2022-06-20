require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const md5 = require('md5');

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

const userSchema = new mongoose.Schema({});

const secretSchema = new mongoose.Schema({
    userId: String,
    secret: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Secret = new mongoose.model("Secret", secretSchema);

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
    if (req.isAuthenticated()) {
        loginStatus = "Log Out"
        loginStatusRoute = "/logout"
    }
    else {
        loginStatus = "Log In"
        loginStatusRoute = "/login"
    }
    Secret.find({}, 'secret', (err, docs) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('secrets', {
                secret: docs,
                displayedSecrets: "Show only my secrets",
                toShow: "mySecrets",
                loginStatus: loginStatus,
                loginStatusRoute: loginStatusRoute
            })
        }
    });
});

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

app.get('/manage', (req, res) => {
    if (req.isAuthenticated()) {
        Secret.find({ userId: md5(req.user._id) }, (err, docs) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('controlpanel', {
                    secret: docs,
                    loginStatus: loginStatus,
                    loginStatusRoute: loginStatusRoute
                })
            }
        })
    }
    else {
        res.redirect('/login');
    }
})
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

        const newSecret = Secret({
            userId: md5(req.user._id),
            secret: req.body.secret
        })
        newSecret.save()
        res.redirect('/secrets');

    }
    else {
        res.redirect('/login');
    }
});

app.post('/secrets', (req, res) => {
    console.log(req.user);
    if (req.isAuthenticated() && req.body.mySecrets) {
        Secret.find({ userId: md5(req.user._id) }, (err, docs) => {
            if (err) {
                console.log(err);
            }
            else {
                res.render('secrets', {
                    secret: docs,
                    displayedSecrets: "Show all secrets",
                    toShow: "allSecrets",
                    loginStatus: "Log Out"
                })
            }
        });
    }
    else if (req.isAuthenticated && req.body.allSecrets) {
        res.redirect('/secrets');
    }
    else {
        res.redirect('/login');
    }
});

app.post('/deletesecret', (req, res) => {
    if (req.isAuthenticated()) {
        Secret.deleteOne({ _id: req.body.toDelete }, (err) => {
            if (err) {
                console.log(err);
            }
        })
        Secret.find({ _userId: md5(req.user._id) }, (err, docs) => {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('/manage');
                    }
        })

    }
    else {
        res.redirect('/login')
    }
})

let PORT
if (process.env.PORT) {
    PORT = process.env.PORT;
}
else {
    PORT = 3000
}

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server is running on port " + PORT + ".")
    }
});