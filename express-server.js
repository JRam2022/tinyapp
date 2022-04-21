const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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

////////
const urlsForUser = function(id) {
 let matchingUrlID = {};
  for (url in urlDatabase) {
    //console.log('URL IN DATABASE', url)
    //console.log('URL USER ID', urlDatabase[url]['userID'])
    if (urlDatabase[url]['userID'] === id) {
      //console.log('matched')
      
      matchingUrlID[url] = {
        longURL: urlDatabase[url]['longURL'],
        userID: urlDatabase[url]['userID']
      }
    }
  }

  return matchingUrlID;
}

app.get('/urls', (req, res) => {
  const user_id = req.cookies['user_id']
  const urls = urlsForUser(user_id)
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
    userID: req.cookies['user_id']
  }

  if (!req.cookies['user_id']) {
    res.status(401)
    res.send('Please Login')
  }

  res.redirect(`/urls/${newURL}`);
});


app.get('/urls/new', (req, res) => {
  const templateVars = {
    
    user: req.cookies['user_id']
  };

  if (!req.cookies['user_id']) {
    res.redirect('/login')
  } 

  res.render('urls_new', templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[req.params.shortURL]['longURL']
  const user_id = req.cookies['user_id']

  if (urlDatabase[shortURL]['userID'] !== user_id ) {
    res.status(400).send('error id does not match')
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    user: req.cookies['user_id']
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
  const user_id = req.cookies['user_id']

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
  const user_id = req.cookies['user_id']
  
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }

  res.redirect(`/urls/${req.params.id}`);
});


app.post('/login', (req, res) => {
  
  const usersArray = Object.values(users)
  
  for (const user in usersArray) {
    if (usersArray[user]['email'] === req.body.email) {
      //console.log('EMAIL FOUND')
      if (usersArray[user]['password'] === req.body.password){
        //console.log('PASSWORD FOUND')
        //LOGIN
        //UPDATE COOKIE TO USER FOUNDS ID
        res.cookie("user_id", usersArray[user]['id'])
        //redirect to url
        res.redirect(`/urls`);
      }
    } 
  }
  //REJECT IF NOT FOUND
  res.statusCode = 403;
  console.log('Invalid credentials')
  res.redirect(`/login`);
});


app.get('/login', (req, res) => {
  const user_id = req.cookies['user_id']
  const templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  };
  

  res.render('user_login', templateVars);
})


app.post('/logout', (req, res) => {
  
  res.clearCookie("user_id");
  
  res.redirect(`/urls`);
});


app.get('/register', (req, res) => {
  const templateVars = { user: res.cookie['user_id']}
  
  res.render("registration", templateVars)
  
});


app.post('/register', (req, res) => {
  const newID = generateRandomString();

  if (!req.body.email || !req.body.password) {
    res.statusCode = 400;
    res.send('Fields cannot be empty')
  } 

  const usersArray = Object.values(users)
  
  for (const user in usersArray) {
    if (usersArray[user]['email'] === req.body.email) {
     res.send('email is registered') // message
     res.statusCode = 400 // error
    } 
  }

  users[newID] = {
    id: newID, 
    email: req.body.email, 
    password: req.body.password
  }
  //console.log(users[newID])

  res.cookie("user_id", newID)
  res.redirect('/urls')
  
});


app.listen(PORT, () =>{
  console.log((`Example app listening on port ${PORT}!`));
});


const generateRandomString = function() {
  // array of 52 letters for random generation
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  //console.log(alphabet.length)
  let randomStr = '';
  //generates 6 random indexs of alphabet between 0-62
  for (let i = 0; i < 6; i++) {
    let generateNum = Math.floor(Math.random() * 62);
    randomStr += alphabet[generateNum];
  }
  return randomStr;
};