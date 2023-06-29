// Function that takes in email address and checks users database for match
const getUserByEmail = (email, database) => {
  for (const userKey in database) {
    const user = database[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

module.exports = { getUserByEmail };