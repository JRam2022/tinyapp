const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
//I used this function differently :\
describe('getUserByEmail', function() {
  it('should return true if match', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = true;
    // Write your assert statement here
    assert.equal(user, expectedUserID)
  });

  it('should return false if no match', function() {
    const user = getUserByEmail("user67@example.com", testUsers)
    const expectedUserID = false;
    // Write your assert statement here
    assert.equal(user, expectedUserID)
  });

});