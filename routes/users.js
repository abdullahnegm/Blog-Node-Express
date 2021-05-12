const express = require("express");
const userRoute = express();

const methodOverride = require("method-override");

// Test
const cors = require("cors");
userRoute.use(cors());

// Users Model
const Users = require("../models/users");

// Require ejs template engine
const ejs = require("ejs");
userRoute.set("view engine", "ejs");

// Validation
const userSchema = require("../validation/user");
const validator = require("express-joi-validation").createValidator({});

// Middlewares
const Auth = require("../middlewares/authMiddleware");
const isAuth = require("../middlewares/isAuthenticated");
const isNotAuth = require("../middlewares/isNotAuthenticated");

// Authentication using Passport
const passport = require("passport");

const initializePassport = require("../services/passport-config");
initializePassport(passport);

const flash = require("express-flash");
const session = require("express-session");

userRoute.use(flash());
userRoute.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

userRoute.use(passport.initialize());
userRoute.use(passport.session());

userRoute.use(methodOverride("_method"));

userRoute.use(express.urlencoded({ extended: false }));

userRoute.get("/login", isNotAuth, (req, res) => {
  return res.render("login");
});

userRoute.get("/", async (req, res, next) => {
  try {
    let users = await Users.find({});
    return res.send(users);
  } catch (e) {
    next(e);
  }
});

userRoute.get("/register", isNotAuth, (req, res) => {
  console.log("3");
  return res.render("register");
});

userRoute.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

userRoute.post("/register", async (req, res, next) => {
  console.log("7");
  try {
    let validationResult = userSchema.validate(req.body);
    if (validationResult.error) return res.status(400).render("register");
    let email = await Users.findOne({ email: req.email });
    if (email)
      res.render("register", { ...req.body, error: "Email already exists" });

    await Users.create(req.body);

    return res.redirect("/users/login");
  } catch (e) {
    next(e);
  }
});

userRoute.get("/profile", isAuth, async (req, res, next) => {
  console.log("6");
  try {
    return res.render("profile", { user: req.user });
  } catch (e) {
    next(1);
  }
});

userRoute.get("/edit", isAuth, async (req, res, next) => {
  console.log("5");
  try {
    return res.render("editprofile", { user: req.user });
  } catch (e) {
    next(1);
  }
});

userRoute.get("/:id", async (req, res, next) => {
  console.log("5");
  try {
    let id = req.params.id;
    let user = await Users.findById(id);
    return res.send(user);
  } catch (e) {
    next(1);
  }
});

userRoute.delete("/:id", async (req, res, next) => {
  console.log("8");
  try {
    await req.user.remove();
    return res.send(req.user);
  } catch (e) {
    next(e);
  }
});

userRoute.patch("/:id", isAuth, async (req, res, next) => {
  console.log("9");
  const allowed_inputs = ["username", "address", "age", "email"];
  const keys = Object.keys(req.body);
  const isIncluded = keys.every((key) => allowed_inputs.includes(key));

  if (!isIncluded) return res.render("wrong");

  try {
    keys.forEach((key) => (req.user[key] = req.body[key]));
    await req.user.save();
    return res.redirect("/user/profile");
  } catch (e) {
    console.log(e.message);
  }
});

userRoute.get("/:id/isfollowed", (req, res) => {
  console.log("10");
  req.user.is_followed(req.params.id);
  return res.send("lol");
});

userRoute.get("/:id/follow", async (req, res, next) => {
  console.log("11");
  let id = req.params.id;

  try {
    let user = await Users.findById(id);
    if (!user) next(1);

    let user_follow = await req.user.check_follows(id);
    return res.send(user_follow);
  } catch (e) {
    console.log(e.message);
  }
});

userRoute.use((err, req, res, next) => {
  console.log("12");
  if (err == 1) return res.status(404).send("This user doesn't exist");
  return res.status(500).send(err);
});

module.exports = userRoute;
