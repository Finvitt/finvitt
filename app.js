const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

app.use(session({
  secret: "It is the finvitt project",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/profileDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);

const profileSchema = new mongoose.Schema({
  fname: String,
  mname: String,
  lname: String,
  phoneNum: Number,
  email: String,
  password: String,
  gender: String,
  registrationPhotograph: String,
  certificate_10: String,
  certificate_12: String,
  aadhaarCard: String,
  panCard: String,
  address: String,
  mother_fName: String,
  mother_mName: String,
  mother_lName: String,
  father_fName: String,
  father_mName: String,
  father_lName: String
});

profileSchema.plugin(passportLocalMongoose);

const Profile = mongoose.model("Profile", profileSchema);

passport.use(Profile.createStrategy());

passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());

app.get("/", function(req, res) {
  res.render("Home");
});

app.get("/Success/Profile", function(req, res) {
  if (req.isAuthenticated()) {
    const module = require('module');
    Profile.findOne({
      email: req.body.username
    }, function(err, foundProfile) {
      if (err) {
        console.log(err);
      } else {
        if (foundProfile) {
          console.log(foundProfile);
          res.render("Profile", {
            Profile_of_applicant: foundProfile
          });
        }
      }
    });
  } else {
    res.redirect("/");
  }
});

app.get("/Register", function(req, res) {
  res.render("Register");
})

app.get("/Login", function(req, res) {
  res.render("Login");
})

app.get("/Success", function(req, res) {
  if (req.isAuthenticated()) {
    const module = require('module');
    res.render("Success");
  } else {
    res.redirect("/");
  }
});


app.post("/Register", function(req, res) {
  Profile.register({
    username: req.body.username,
    fname: req.body.fName,
    lname: req.body.lName,
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/Register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/Login");
      })
    }
  })
});

app.post("/Login", function(req, res) {

  const profile = new Profile({
    username: req.body.username,
    fName: req.body.fName,
    lName: req.body.lName,
    password: req.body.password
  });

  req.login(profile, function(err) {
    if (err) {
      console.log(err);
    } else {
      Profile.findOne({
        username: req.body.username
      }, function(err, foundProfile) {
        if (err) {
          console.log(err);
        } else {
          if (foundProfile) {
            passport.authenticate("local")(req, res, function() {
              // res.redirect("/Success/Profile");
              console.log(foundProfile);
              res.render("Profile", {
                Profile_of_applicant: foundProfile
              });
            });
          } else {
            console.log("Not found");
          }
        }
      })
    }
  })
});

app.post("/Profile", function(req, res) {
  const profile = new Profile({
    fname: req.body.fname,
    mname: req.body.mname,
    lname: req.body.lname,
    phoneNum: req.body.phone_num,
    email: req.body.email,
    gender: req.body.gender,
    registrationPhotograph: req.body.registration_photograph,
    certificate_10: req.body.certificate_10,
    certificate_12: req.body.certificate_12,
    aadhaarCard: req.body.aadhaar_card,
    panCard: req.body.pan_card,
    address: req.body.address_proof,
    mother_fName: req.body.mother_fName,
    mother_mName: req.body.mother_mName,
    mother_lName: req.body.mother_lName,
    father_fName: req.body.father_fName,
    father_mName: req.body.father_mName,
    father_lName: req.body.father_lName
  });
  profile.save();
  res.redirect("/");
})

app.listen(process.env.PORT || 3000, function() {
  console.log("i am at port 3000")
})