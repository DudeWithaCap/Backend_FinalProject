const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorLogger');
const bookController = require('../controllers/bookController');

router.get('/', asyncHandler(bookController.getAllBooks));
router.get('/:id', asyncHandler(bookController.getBookById));

router.post('/', verifyToken, isAdmin, asyncHandler(bookController.createBook));
router.put('/:id', verifyToken, isAdmin, asyncHandler(bookController.updateBook));
router.delete('/:id', verifyToken, isAdmin, asyncHandler(bookController.deleteBook));

module.exports = router;
