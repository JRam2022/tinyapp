const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

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
  const user_id = req.cookies['user_id']
  const templateVars = {
    urls: urlDatabase,
    
    user: users[user_id]
    
  };
  
  
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let newURL = generateRandomString();
  
  urlDatabase[newURL] = req.body.longURL;

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
  const templateVars = {
    shortURL:req.params.shortURL,
    longURL:urlDatabase[req.params.shortURL],
    user: req.cookies['user_id']
  };
  
  res.render("urls_show", templateVars);
});





app.get('/u/:shortURL', (req, res) =>{
  let longURLdata = urlDatabase[req.params.shortURL];
  
  if (longURLdata.startsWith('http')) {
    res.redirect(longURLdata);
  } else {
    res.redirect("https://" + longURLdata);
  }
});


app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.post('/urls/:id', (req, res) => {
  
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});


app.post('/login', (req, res) => {
  //if no email found return 403
  //if email true compare password in form with stored password
    //if passwords not same return 403

  //if both checks pass
    //set user_id cookie with users random id

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
  //emailChecker(req.body.email, res.statusCode = 400, res.send('email is registered'));

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

  //console.log(Object.values(users))
  
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

//const emailChecker = function(email, error, message) {
//  const usersArray = Object.values(users)
//  console.log(usersArray);
//  for (const user in usersArray) {
//    console.log(usersArray[user])
//    console.log(usersArray[user]['email'])
//    if (usersArray[user]['email'] === email) {
//      error
//      message
//      return;
//    } 
//  }
//}

