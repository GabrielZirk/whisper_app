require('dotenv').config(); //Require environment variable package as soon as possible
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');


const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

//----------------------------MongoDB/Mongoose setup incl. encryption
mongoose.connect("mongodb://localhost:27017/userDBSecrets");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//--- Define encryption before creating the model
const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']}); //Encrypt only the password field

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

    newUser.save((err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('secrets');
        }
    }
    )
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
            else if (foundUser.password === loginPW) {
                res.render('secrets');
            }
            else if (foundUser.password !== loginPW) {
                res.send("OOOOOPS, wrong passord!");
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