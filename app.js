require('dotenv').config(); //Require environment variable package as soon as possible
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS);

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//----------------------------MongoDB/Mongoose setup
mongoose.connect("mongodb://localhost:27017/userDBSecrets");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const User = new mongoose.model("User", userSchema);

//----------------------------GET REQUESTS
app.get("/", (req, res) => {
    res.render('home');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.get("/login", (req, res) => {
    res.render('login');
});

//----------------------------POST REQUESTS
app.post("/register", (req, res) => {
    const userMail = req.body.username;
    const userPW = req.body.password

    bcrypt.hash(userPW, saltRounds, (err, hash) => {

        if (err) {
            console.log(err);
        }
        else {
            const newUser = new User({
                email: userMail,
                password: hash
            })

            newUser.save((err) => {
                if (err) {
                    console.log(err);
                }
                else {
                    res.render('secrets');
                }
            }
            )
        }
    });

});

app.post("/login", (req, res) => {
    const loginMail = req.body.username;
    const loginPW = req.body.password;
    User.findOne({ email: loginMail }, (err, foundUser) => {
        if (err) {
            console.log(err);
        }
        else {
            if (!foundUser) {
                res.send("OOOOOPS, no such mail found!")
            }
            else {
                bcrypt.compare(loginPW, foundUser.password, (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (result) {
                            res.render("secrets");
                        }
                        else {
                            res.send("OOOOOPS, wrong passord!");
                        }
                    }
                })
            }
        }
    })
});

app.listen("3000", (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Server is running on port 3000.")
    }
});