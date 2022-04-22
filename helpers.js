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


const urlsForUser = function(id, database) {
  let matchingUrlID = {};
  for (url in database) {
    //console.log('URL IN DATABASE', url)
    //console.log('URL USER ID', urlDatabase[url]['userID'])
    if (database[url]['userID'] === id) {
      //console.log('matched')
      
      matchingUrlID[url] = {
      longURL: database[url]['longURL'],
      userID: database[url]['userID']
      }
    }
  }
  return matchingUrlID;
}

//const database = urlDatabase
//const email = '1@1.com'
const getUserByEmail = function(email, database) {
  // lookup magic...
  const lookupObject = Object.values(database)
  //console.log('OBJECT', lookupObject)
  
  for (const item of lookupObject) {
    //console.log('ITEM', item)
    //console.log('EMAIL', email)
    if (item['email'] === email) {
      return true;
    } 
  }
  return false;
};

module.exports = { urlsForUser, getUserByEmail, generateRandomString }
//getUserByEmail(email, database)