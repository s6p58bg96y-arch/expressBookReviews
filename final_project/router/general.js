const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: "Book not found" });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const result = Object.keys(books)
        .filter((isbn) => books[isbn].author === author)
        .map((isbn) => ({ isbn: isbn, title: books[isbn].title, reviews: books[isbn].reviews }));
    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbyauthor: result }, null, 4));
    }
    return res.status(404).json({ message: "No books found for this author" });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const result = Object.keys(books)
        .filter((isbn) => books[isbn].title === title)
        .map((isbn) => ({ isbn: isbn, author: books[isbn].author, reviews: books[isbn].reviews }));
    if (result.length > 0) {
        return res.status(200).send(JSON.stringify({ booksbytitle: result }, null, 4));
    }
    return res.status(404).json({ message: "No books found with this title" });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
    return res.status(404).json({ message: "Book not found" });
});

// ---------------------------------------------------------------
// Tasks 10 - 13: the same operations using async/await with Axios
// ---------------------------------------------------------------

// Task 10: Get all books using async/await
const getAllBooks = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching book list: " + error.message);
    }
};

// Task 11: Get book details by ISBN using Promises
const getBookByISBN = (isbn) => {
    return axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then((response) => response.data)
        .catch((error) => {
            throw new Error("Error fetching book by ISBN: " + error.message);
        });
};

// Task 12: Get book details by author using async/await
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching books by author: " + error.message);
    }
};

// Task 13: Get book details by title using async/await
const getBooksByTitle = async (title) => {
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching books by title: " + error.message);
    }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
