/*------------------------  DEPENDENCIES  ------------------------*/
const express = require("express");
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

const {
  generateRandomString,
  getUserByEmail,
  urlsForUser
} = require("./helpers");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ["hXlF4ON92Ej4kH_nLmzkqI_Zki0"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

/*-------------------------  DATABASES  -------------------------*/
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    createdDate: "",
    visitCount: 0
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
    createdDate: "",
    visitCount: 0
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

/*-----------------------  RENDER ROUTES  -----------------------*/
app.get("/", (req, res) => {
  // set userID to session cookie
  const userID = req.session.userID;
  // user is not logged in, redirect to login page
  if (!users[userID]) {
    res.redirect("/login");
    return;
  }
  // user is logged in, redirect to urls page
  res.redirect("/urls");
});

// View users URLs
app.get("/urls", (req, res) => {
  // set userID to session cookie
  const userID = req.session.userID;

  // user is not logged in, render error page
  if (!users[userID]) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
    return;
  }

  // filtered url database
  const database = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: database,
    user: users[userID]
  };
  // render urls_index page to user with template variables
  res.render("urls_index", templateVars);
});

// View route to create new URL
app.get("/urls/new", (req, res) => {
  // set userID to session cookie
  const userID = req.session.userID;

  // user is not logged in, redirect to login page
  if (!users[userID]) {
    res.redirect("/login");
    return;
  }

  const templateVars = {
    user: users[userID]
  };
  // render urls_new page to user with template variables
  res.render("urls_new", templateVars);
});

// View route to registration page
app.get("/register", (req, res) => {
  // set userID to session cookie
  const userID = req.session.userID;

  // user is logged in, redirect
  if (users[userID]) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: users[userID]
  };
  // render register page with template variables
  res.render("register", templateVars);
});

// View route to login page
app.get("/login", (req, res) => {
  // set userID to session cookie
  const userID = req.session.userID;

  // user is logged in, redirect
  if (users[userID]) {
    res.redirect("/urls");
    return;
  }

  const templateVars = {
    user: users[userID]
  };
  // render login page with template variables
  res.render("login", templateVars);
});

// View route to one URL
app.get("/urls/:id", (req, res) => {
  // set id to parameter from GET request
  const id = req.params.id;
  // set userID to session cookie
  const userID = req.session.userID;

  // url does not exist in database, render error page
  if (!urlDatabase[id]) {
    res.status(404);
    res.render("errorPage", {
      status: 404,
      message: `${id} URL does not exist`,
      redirectLink: null
    });
    return;
  }

  // user is not logged in, render error page
  if (!users[userID]) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
    return;
  }

  // user does not own url, render error page
  if (urlDatabase[id].userID !== userID) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "You do not have access to this URL.",
      redirectLink: null
    });
    return;
  }

  const templateVars = {
    user: users[userID],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    visitCount: urlDatabase[id].visitCount
  };
  // render urls_show page with template variables
  res.render("urls_show", templateVars);
});

// Route to redirect to long URL
app.get("/u/:id", (req, res) => {
  // set id to parameter from GET request
  const id = req.params.id;
  // set longURL to value of longURL from parameter passed in GET request
  const longURL = urlDatabase[req.params.id].longURL;

  // set session views to value or if none, 0, and then add one
  req.session.views = (req.session.views || 0) + 1;
  // update url visit count
  urlDatabase[id].visitCount = req.session.views;

  // redirect user to page of the longURL
  res.redirect(longURL);
});

// View route to json file of url database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*------------------------  API ROUTES  ------------------------*/
// Create new URL
app.post("/urls", (req, res) => {
  // set userID to session cookie
  const userID = req.session.userID;

  // user is not logged in, render error page
  if (!users[userID]) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
    return;
  }

  // set longURL to POST request value
  const longURL = req.body.longURL;
  // set id to random 6 character string
  const id = generateRandomString();
  // add url object to urlDatabase and set values
  urlDatabase[id] = {
    longURL: longURL,
    userID: userID,
    // set date short URL was created
    createdDate: new Date().toUTCString(),
    // starting view count
    visitCount: 0
  };
  // redirect user to url page
  res.redirect(`/urls/${id}`);
});

// Update URL
app.put("/urls/:id", (req, res) => {
  // set id to parameter from GET request
  const id = req.params.id;
  // set longURL to POST request value
  const longURL = req.body.longURL;
  // set userID to session cookie
  const userID = req.session.userID;

  // id does not exist, render error page
  if (!urlDatabase[id]) {
    res.status(404);
    res.render("errorPage", {
      status: 404,
      message: `${id} URL does not exist`,
      redirectLink: null
    });
    return;
  }

  // user is not logged in, render error page
  if (!users[userID]) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
    return;
  }

  // user does not own url, render error page
  if (urlDatabase[id].userID !== userID) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "You do not have access to this URL.",
      redirectLink: null
    });
    return;
  }

  // update long url to url entered in POST request
  urlDatabase[id].longURL = longURL;
  // redirect user to urls page
  res.redirect("/urls");
});

// Delete URL
app.delete("/urls/:id", (req, res) => {
  // set id to value from POST request
  const id = req.params.id;
  // set userID to session cookie
  const userID = req.session.userID;

  // id does not exist in url database, render error page
  if (!urlDatabase[id]) {
    res.status(404);
    res.render("errorPage", {
      status: 404,
      message: `${id} URL does not exist`,
      redirectLink: null
    });
    return;
  }

  // user is not logged in, render error page
  if (!users[userID]) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "Please Register or Login to view URLs",
      redirectLink: "/login"
    });
    return;
  }

  // user does not own url, render error page
  if (urlDatabase[id].userID !== userID) {
    res.status(403);
    res.render("errorPage", {
      status: 403,
      message: "You do not have access to this URL.",
      redirectLink: null
    });
    return;
  }

  // clear url id from url database, which deletes the url
  delete urlDatabase[id];
  // redirect user to urls page, url from POST request will be gone
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  // set id to random 6 character string
  const id = generateRandomString();
  // set email and password to values from POST request
  const email = req.body.email;
  const password = req.body.password;
  // hash password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // no email or password entered, render error page
  if (!email || !password) {
    res.status(400);
    res.render("errorPage", {
      status: 400,
      message: "Please enter valid Email Address and Password",
      redirectLink: "/register"
    });
    return;
  }

  // email already exists in users database, can't register with duplicate email
  if (getUserByEmail(email, users)) {
    res.status(400);
    res.render("errorPage", {
      status: 400,
      message: "Account already exists with this email",
      redirectLink: "/register"
    });
    return;
  }

  // add user object to users database and set values
  users[id] = { id, email, hashedPassword };
  // set cookie for user using their id
  req.session.userID = id;
  // redirect user to urls page
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  // set email and password to values from POST request
  const email = req.body.email;
  const password = req.body.password;
  // find user in users database
  const user = getUserByEmail(email, users);

  // user is not in database, render error page
  if (!user) {
    res.status(404);
    res.render("errorPage", {
      status: 404,
      message: "Email cannot be found. Please Register for your account first.",
      redirectLink: "/register"
    });
    return;
  }
  // entered password does not match password in database, render error page
  if (!bcrypt.compareSync(password, user.hashedPassword)) {    
    res.status(401);
    res.render("errorPage", {
      status: 401,
      message: "Incorrect Password. Try again.",
      redirectLink: "/login"
    });
    return;
  }
  // correct login information, set cookie for user using their id
  req.session.userID = user.id;
  // redirect user to urls page
  res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  // clear cookie
  req.session = null;
  // redirect user to login page
  res.redirect("/login");
});

/*-----------------------  LISTEN METHOD  -----------------------*/
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});