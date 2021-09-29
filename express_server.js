const express = require("express");
const cookie = require('cookie');
const cookieParser = require('cookie-parser')

const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
function generateRandomString(string) {
  let result = "";
  for (let i = 6; i > 0; i--) {
    result += string[Math.floor(Math.random() * string.length)];
  }
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
console.log("ALSOHERE",req.cookies)
  const templateVars = { urls: urlDatabase,userName:req.cookies["userName"] };
  console.log("HERE",templateVars)
  res.render("urls_index", templateVars);
  
});
app.get("/urls/new", (req, res) => {
    const templateVars = {userName:req.cookies["userName"]}
  res.render("urls_new",templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],userName:req.cookies["userName"]};
  res.render("urls_show", templateVars);
});
app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    
    res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let randomString = generateRandomString(req.body.longURL);
  urlDatabase[randomString] = req.body.longURL;

  res.redirect("/urls/" + randomString);
});


app.post("/urls/:shortURL/delete",(req ,res)=>{
    
    const shortURL = req.params.shortURL

    delete urlDatabase[shortURL]
    res.redirect("/urls")
    
    
});
app.post("/urls/:shortURL",(req ,res)=>{
    
    const shortURL = req.params.shortURL
    const longURL = req.body.longURL
    console.log("LONGURL",longURL)

     urlDatabase[shortURL] = longURL
    res.redirect("/urls")
    
    
});
app.post ("/login", (req,res)=>{

    const cookieName = req.body.userName
    const templateVars = {
        username: req.cookies["userName"],
        // ... any other vars
      };
    //   res.render("urls_index", templateVars);
    console.log("REQ.BODY",cookieName)
    res.cookie("userName",cookieName )


// const cookie = urlDatabase[userName]
// console.log ("RES.COOKIE",userName)
// console.log("COOKIE",cookie)
res.redirect("/urls")

});
app.post ("/logout", (req,res)=>{
    console.log("URL")
res.clearCookie("userName")
res.redirect ("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});