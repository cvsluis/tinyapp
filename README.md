# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Purpose

This project was built as a part of my learnings at [Lighthouse Labs](https://www.lighthouselabs.ca).

## Final Product

View of Login Page
!["Screenshot of Log In Page"](https://github.com/cvsluis/tinyapp/blob/main/docs/login.png?raw=true)

View of URLs for logged in user
!["Screenshot of URLs Page"](https://github.com/cvsluis/tinyapp/blob/main/docs/urls-page.png?raw=true)

View of Edit page for logged in user
!["Screenshot of Edit Page"](https://github.com/cvsluis/tinyapp/blob/main/docs/url-edit.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Features
- Timestamp for URL creation date
- Visit count and unique viewer tracking stats
- Node package method-override used to simulate PUT and DELETE methods
- Custom Error message page