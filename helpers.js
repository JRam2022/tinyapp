const generateRandomString = function() {
  // array of 52 letters for random generation
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
    if (database[url]['userID'] === id) {
      matchingUrlID[url] = {
        longURL: database[url]['longURL'],
        userID: database[url]['userID']
      };
    }
  }
  return matchingUrlID;
};


const getUserByEmail = function(email, database) {
  const lookupObject = Object.values(database);
  for (const item of lookupObject) {
    if (item['email'] === email) {
      return true;
    }
  }
  return false;
};

module.exports = { urlsForUser, getUserByEmail, generateRandomString };
