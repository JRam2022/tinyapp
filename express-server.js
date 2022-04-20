const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};


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

  const templateVars = { urls: urlDatabase };
  
  res.render('urls_index', templateVars);

});


app.get('/urls/new', (req, res) => {
  res.render('urls_new');
})


app.get("/urls/:shortURL", (req, res) => {
  
  const templateVars = { shortURL:req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  
  res.render("urls_show", templateVars);

});

app.post('/urls', (req, res) => {
  let newURL = generateRandomString();
  //console.log(req.body);
  //console.log(newURL, req.body.longURL)
  
  urlDatabase[newURL] = req.body.longURL
  
  //console.log(urlDatabase)
  res.redirect(`/urls/${newURL}`)

});

app.get('/u/:shortURL', (req, res) =>{
  let longURLdata = urlDatabase[req.params.shortURL];
  //console.log("this is the short url:", longURLdata);
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
  //console.log('id ---:', req.params.id)
  urlDatabase[req.params.id] = req.body.longURL

  res.redirect(`/urls/${req.params.id}`)
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

  };

  return randomStr;

};
