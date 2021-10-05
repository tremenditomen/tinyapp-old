
const bcrypt = require("bcryptjs");
const getUserByEmail = function (email, users) {
    let foundUser = null;
    for (user in users) {
      if (users[user].email === email) {
        foundUser = users[user];
      }
    }
    return foundUser;
  };

  module.exports = {getUserByEmail}