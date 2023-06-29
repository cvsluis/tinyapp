// Function that returns random string of 6 characters
const generateRandomString = () => {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// Function that takes in email address and returns match in users database
const getUserByEmail = (email, database) => {
  for (const userKey in database) {
    const user = database[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return;
};

// Function that returns the URLS of specific userID
const urlsForUser = (id) => {
  const newDatabase = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      newDatabase[url] = urlDatabase[url];
    }
  }
  return newDatabase;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };