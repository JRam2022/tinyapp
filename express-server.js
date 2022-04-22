const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')
const cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['LighthouseLabsIsAwesomeFireEmojiSmirkEmojiOkayHandEmojiOneHundredEmojiFireEmoji']
}))
//const urlsForUser = require('./helpers')
//const getUserByEmail = require('./helpers')
//const generateRandomString = require('./helpers')

const { urlsForUser, getUserByEmail, generateRandomString } = require('./helpers')


app.set('view engine', 'ejs');

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
}


app.get('/', (req, res) => {
  res.send('Hello!');
});


app.get('/hello', (req, res) =>{
  res.send("<html><body>Hello <b>World</b></body</html>\n");
});


app.get('/urls.json', (req, res) =>{
  res.json(urlDatabase);
});


app.get('/urls', (req, res) => {
  const user_id = req.session.user_id
  const urls = urlsForUser(user_id, urlDatabase)
  //console.log(urls)
  const templateVars = {
    urls: urls,
    user: users[user_id]
  };
  
  
  res.render('urls_index', templateVars);
});


app.post('/urls', (req, res) => {
  let newURL = generateRandomString();
  const longURL = req.body.longURL
  if (!longURL.startsWith('http://') && !longURL.startsWith('https://')){
  res.status(400).send('URL must start with http(s)')
  return;
  }
  urlDatabase[newURL] = {
    longURL: req.body.longURL, 
    userID: req.session.user_id

  }

  if (!req.session.user_id) {
    res.status(401)
    res.send('Please Login')
  }

  res.redirect(`/urls/${newURL}`);
});


app.get('/urls/new', (req, res) => {
  //console.log(req.body)
  //console.log(users)
  //console.log(users[req.session.user_id])

  const templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id) {
    res.status(403)
    res.redirect('/login')
  } 
  res.render('urls_new', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  const user_id = req.session.user_id

  if (urlDatabase[shortURL]['userID'] !== user_id ) {
    res.status(400).send('error id does not match')
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: req.session.user_id
  };
  
  res.render("urls_show", templateVars);
});


app.get('/u/:shortURL', (req, res) =>{
  const shortURL = req.params.shortURL
  if (!urlDatabase[shortURL]) {
    res.status(400).send('not in in urldatabase')
    return;
  }
  const longURLdata = urlDatabase[req.params.shortURL]['longURL']
  //.log(urlDatabase)
  //console.log('-------->', longURLdata)
  if (longURLdata.startsWith('https://') || longURLdata.startsWith('http://')){
    res.redirect(longURLdata);
  } else {
    res.status(400).send('Please enter a url with http')
    //res.send('Please enter a url with http')
  }
  
});


app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  const user_id = req.session.user_id

  if (!user_id) {
    res.status(400).send('Please login');
  }

  if (urlDatabase[shortURL]['userID'] !== user_id ) {
    res.status(400).send('error id does not match')
  }
  
  delete urlDatabase[req.params.shortURL];

  
  res.redirect('/urls');
});


app.post('/urls/:id', (req, res) => {
  
  
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  }

  res.redirect(`/urls/${req.params.id}`);
});


app.post('/login', (req, res) => {
  const usersArray = Object.values(users)
  const password = req.body.password
  const email = req.body.email
  const database = users
  //const foundEmail = getUserByEmail(email1, database1)
  //console.log(foundEmail)
  //const hashedPassword = bcrypt.hashSync(password, 10);

  
  
  if (getUserByEmail(email, database)) {
      //console.log('EMAIL FOUND')
      //console.log(hashedPassword)
    for (const user in usersArray) {
      if (bcrypt.compareSync(password, usersArray[user]['password'])){
        //console.log('PASSWORD FOUND')
        //LOGIN
        //UPDATE COOKIE TO USER FOUNDS ID
        req.session.user_id = usersArray[user]['id']
        //redirect to url
        res.redirect(`/urls`);
      }
    } 
  }
  //REJECT IF NOT FOUND
  res.status(400).send('Invalid credentials')
  
  res.redirect(`/login`);
});


app.get('/login', (req, res) => {
  const user_id = req.session.user_id
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  

  res.render('user_login', templateVars);
})


app.post('/logout', (req, res) => {
  
  req.session = null;
  
  res.redirect(`/urls`);
});


app.get('/register', (req, res) => {
  const templateVars = { user: req.session.user_id }
  
  res.render("registration", templateVars)
  
});


app.post('/register', (req, res) => {
  const newID = generateRandomString();
  const password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10)
  const email = req.body.email
  const database = users

  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send('Fields cannot be empty')
  } 


  if (getUserByEmail(email, database)) {
   res.send('email is registered') // message
   res.statusCode = 400 // error
  }
  
  
  users[newID] = {
    id: newID, 
    email: req.body.email, 
    password: hashedPassword
  }
  //console.log(users[newID])

  req.session.user_id = newID;
  res.redirect('/urls')
  
});


app.listen(PORT, () =>{
  console.log((`Example app listening on port ${PORT}!`));
});


