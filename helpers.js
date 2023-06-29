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

module.exports = { getUserByEmail };