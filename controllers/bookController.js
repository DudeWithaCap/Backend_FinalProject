const Book = require('../models/book');

async function getAllBooks(req, res, next) {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    next(err);
  }
}

async function getBookById(req, res, next) {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
}

async function createBook(req, res, next) {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    next(err);
  }
}

async function updateBook(req, res, next) {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.json(updatedBook);
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req, res, next) {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      const err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
