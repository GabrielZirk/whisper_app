const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
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
    const newUser = new User({
        email: userMail,
        password: userPW
    })
});

app.post("/login", (req, res) => {
    console.log("Login");
});

app.listen("3000", (err) => {
    if(err) {
        console.log(err);
    }
    else {
        console.log("Server is running on port 3000.")
    }
});