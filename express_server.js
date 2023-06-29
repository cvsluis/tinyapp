const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Function that returns random string of 6 characters
const generateRandomString = () => {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// Function that takes in email address and checks users database for match
const getUserByEmail = (email) => {
  for (const userKey in users) {
    const user = users[userKey];
    if (user.email === email) {
      return user;
    }
  }
  return null;
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

/*------------------------  RENDER ROUTES  ------------------------*/
app.get("/", (req, res) => {
  res.send("Hello!");
});

// View users URLs
app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;

  // user is not logged in
  if (!users[userId]) {
    res.status(400).send("Please register or login to view URLs");
    return;
  }

  // filtered url database
  const database = urlsForUser(userId);
  const templateVars = {
    urls: database,
    user: users[userId]
  };
  res.render("urls_index", templateVars);
});

// View route to create new URL
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;

  // user is not logged in, redirect to login page
  if (!users[userId]) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    user: users[userId]
  };
  res.render("urls_new", templateVars);
});

// View route to registration page
app.get("/register", (req, res) => {
  const userId = req.cookies.userId;

  // user is logged in, redirect
  if (users[userId]) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: users[userId]
  };
  res.render("register", templateVars);
});

// View route to login page
app.get("/login", (req, res) => {
  const userId = req.cookies.userId;

  // user is logged in, redirect
  if (users[userId]) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: users[userId]
  };
  res.render("login", templateVars);
});

// View route to one URL
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies.userId;

  // url does not exist in database
  if (!urlDatabase[id]) {
    res.status(400).send("URL does not exist in database.");
    return;
  }

  // user is not logged in
  if (!users[userId]) {
    res.status(400).send("Please login to view URLs");
    return;
  }

  // user does not own url
  if (urlDatabase[id].userID !== userId) {
    res.status(400).send("You do not have access to this URL.");
    return;
  }

  const templateVars = {
    user: users[userId],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

// Route to redirect to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// View route to json file of url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*------------------------  API ROUTES  ------------------------*/
// Create new URL
app.post("/urls", (req, res) => {
  const userId = req.cookies.userId;

  // user is not logged in, send error message
  if (!users[userId]) {
    res.status(403).send("Please log in to shorten URLs.");
    return;
  }

  const longURL = req.body.longURL;
  const id = generateRandomString();

  urlDatabase[id] = {
    longURL: longURL,
    userID: userId
  };
  res.redirect(`/urls/${id}`);
});

// Update URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.cookies.userId;

  // id does not exist
  if (!urlDatabase[id]) {
    res.status(400).send("URL does not exist");
    return;
  }

  // user is not logged in
  if (!users[userId]) {
    res.status(403).send("Please log in to shorten URLs.");
    return;
  }

  // user does not own url
  if (urlDatabase[id].userID !== userId) {
    res.status(400).send("You do not have access to this URL.");
    return;
  }

  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.cookies.userId;

  // id does not exist
  if (!urlDatabase[id]) {
    res.status(400).send("URL does not exist");
    return;
  }

  // user is not logged in
  if (!users[userId]) {
    res.status(403).send("Please log in to shorten URLs.");
    return;
  }

  // user does not own url
  if (urlDatabase[id].userID !== userId) {
    res.status(400).send("You do not have access to this URL.");
    return;
  }
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).send("Enter valid email and password.");
    return;
  }

  if (getUserByEmail(email)) {
    res.status(400).send("Account already exists with this email.");
    return;
  }

  users[id] = { id, email, password };
  res.cookie("userId", id);
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);

  if (!user) {
    res.status(403).send("Email cannot be found.");
    return;
  }

  if (user.password !== password) {
    res.status(403).send("Incorrect password.");
    return;
  }

  res.cookie("userId", user.id);
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect("/login");
});

/*------------------------  LISTEN METHOD  ------------------------*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});