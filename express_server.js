const express = require("express");
const cookie = require("cookie");
const cookieParser = require("cookie-parser");
const {getUserByEmail} = require ("./helpers")

// == USE bcrypt when storing passwords
const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinoaur";
const hashedPassword = bcrypt.hashSync(password, 10);

console.log("hashedPassword", hashedPassword);

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
function generateRandomString(string) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const characterLength = 6;
  for (let i = 0; i <= characterLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characterLength));
  }
  return result.toLocaleLowerCase();
}

const users = {
  RandomID: {
    id: "userRandomID",
    email: "user@user.com",
    password: bcrypt.hashSync("1234"),
  },

  user2RandomID: {
    id: "user2RandomID",
    email: "user2@user.com",
    password: bcrypt.hashSync("4321"),
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const urlsForUser = (user_id) => {
  const shortURLs = {};
  for (const key in urlDatabase) {
    if (user_id === urlDatabase[key]["userID"]) {
      shortURLs[key] = urlDatabase[key]["longURL"];
    }
  }
  console.log("HERE:", shortURLs);
  return shortURLs;
};
app.get("/", (req, res) => {
  res.send("Hello! Welcome home.");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  // console.log("ALSOHERE",req.cookies)
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const templateVars = { urls: urlsForUser(userid), user: users[userid] };
  console.log("USERID:", user);
  if (!user) {
    return res.redirect("/login");
  }
  //   console.log("HERE",templateVars)
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies.user_id };
  console.log("templatevarsuser:", templateVars["user"]);
  if (!templateVars["user"]) {
    return res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...

  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];

  res.redirect(longURL);
});
// GET Register Users
app.get("/register", (req, res) => {
  // check if user exists
  const userid = req.cookies["user_id"];
  const user = users[userid];

  // IF YES, take visitor to URL
  // ELSE register new user
  if (user) {
    return res.redirect("/urls");
  } else {
    const templateVars = { urls: urlDatabase, user: user };
    res.render("urls_register", templateVars);
  }
});
app.get("/login", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const email = req.body.email;
  const password = req.body.password;
  //   if (!user) {
  //  res.redirect('/login')

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[userid],
  };
  res.render("urls_login", templateVars);
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // encrypt password
  const encrypted = bcrypt.hashSync(password, 10);
  const randomID = generateRandomString(req.body.email);

  // CHECK if credentials were passed
  if (email === "" || password === "") {
    res.send("status code:400");
    return null;
  }

  // CHECK if user exist
  for (keys in users) {
    // console.log(users[keys].email);
    if (users[keys].email === email) {
      res.send("status code:400 , email already exists");
      return null;
    }
    // console.log("USERSEMAIL:",users)
  }

  // console.log("IN RANDOMID:",randomID)

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: encrypted,
  };

  res.cookie("user_id", randomID);
  // res.cookie("user",users[randomID])
  // console.log("USERS2:", users);
  res.redirect("/urls");
});
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  const userId = req.cookies["user_id"];
  const user = users[userId];
  if (!user) {
    res.redirect("/login");
  }

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };

  return res.redirect("/urls/");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL]["longURL"] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = getUserByEmail(email, users);
  

  if (!user) {
    res.send("Error code: 403, Account not registerd");
    return;
  } else if (bcrypt.compareSync(password, user.password)) {
    res.cookie("user_id", user.id);

    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = {users}