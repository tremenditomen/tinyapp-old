const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});