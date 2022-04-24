const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const { urlsForUser, getUserByEmail, generateRandomString } = require('./helpers');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['LighthouseLabsIsAwesomeFireEmojiSmirkEmojiOkayHandEmojiOneHundredEmojiFireEmoji']
}));



const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};


app.get('/', (req, res) => {
  res.redirect('/register')
});


app.get('/urls.json', (req, res) =>{
  res.json(urlDatabase);
});


app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const urls = urlsForUser(user_id, urlDatabase);
  const templateVars = {
    urls: urls,
    user: users[user_id]
  };
  res.render('urls_index', templateVars);
});


app.post('/urls', (req, res) => {
  let newURL = generateRandomString();
  const longURL = req.body.longURL;
  //checks to see if urls are submitted correctly
  if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
    res.status(400).send('URL must start with http(s)');
    return;
  }
  urlDatabase[newURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  //Prompts to login if not logged in
  if (!req.session.user_id) {
    res.status(401);
    res.send('Please Login');
  }
  res.redirect(`/urls/${newURL}`);
});


app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  //redirects and sets status code to 403 if not logged in
  if (!req.session.user_id) {
    res.status(403);
    res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  //if shortURL does not exist redirects
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.redirect('/urls');
  }
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  const user_id = req.session.user_id;
  //checks to see if user ids match with one in database
  if (urlDatabase[shortURL]['userID'] !== user_id) {
    res.status(400).send('ID does not match');
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});


app.get('/u/:shortURL', (req, res) =>{
  const shortURL = req.params.shortURL;
  //checks to see if url is valid
  if (!urlDatabase[shortURL]) {
    res.status(400).send('Not in database');
    return;
  }
  const longURLdata = urlDatabase[req.params.shortURL]['longURL'];
  //checks if urls that are submitted are correct, if now errors
  if (longURLdata.startsWith('https://') || longURLdata.startsWith('http://')) {
    res.redirect(longURLdata);
  } else {
    res.status(400).send('Please enter a URL with http(s)');
  }
});


app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  //checks to see if user is logged in to use features
  if (!user_id) {
    res.status(400).send('Please login');
  }
  //checks user ids before deleting a url
  if (urlDatabase[shortURL]['userID'] !== user_id) {
    res.status(400).send('ID does not match');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL/edit', (req,res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});


app.post('/urls/:id', (req, res) => {
  if (!urlDatabase[req.params.id]['longURL']) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${req.params.id}`);
  }
  if (urlDatabase[req.params.id][req.body.longURL] !== urlDatabase[req.params.id]['longURL']) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls`);
  }
});


app.post('/login', (req, res) => {
  const usersArray = Object.values(users);
  const password = req.body.password;
  const email = req.body.email;
  const database = users;
  //checks if the login credentials are valid
  if (getUserByEmail(email, database)) {
    for (const user in usersArray) {
      if (bcrypt.compareSync(password, usersArray[user]['password'])) {
        req.session.user_id = usersArray[user]['id'];
        res.redirect(`/urls`);
      }
    }
  }
  //errors if they are not
  res.status(400).send('Invalid credentials');
  //res.redirect(`/login`);
});


app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  res.render('user_login', templateVars);
});


app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


app.get('/register', (req, res) => {
  const templateVars = { user: req.session.user_id };
  res.render("registration", templateVars);
});


app.post('/register', (req, res) => {
  const newID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const email = req.body.email;
  const database = users;
  //checks if submission fields are filled in properly
  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send('Fields cannot be empty');
  }
  //if the email is registered it wont a make a new account
  if (getUserByEmail(email, database)) {
    res.send('Please use another email');
    res.statusCode = 400;
  }
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: hashedPassword
  };
  //sets cookie for new user
  req.session.user_id = newID;
  res.redirect('/urls');
});


app.listen(PORT, () =>{
  console.log((`Example app listening on port ${PORT}!`));
});


