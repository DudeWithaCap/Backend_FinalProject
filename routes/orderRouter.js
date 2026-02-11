const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorLogger');
const orderController = require('../controllers/orderController');

// proper cart logic
router.post('/cart', verifyToken, asyncHandler(orderController.addToCart));
router.get('/my', verifyToken, asyncHandler(orderController.getMyActiveOrder));
router.delete('/cart/:bookId', verifyToken, asyncHandler(orderController.removeFromCart));

// admin can view cart logics and orders
router.get('/', verifyToken, isAdmin, asyncHandler(orderController.getActiveOrders));

module.exports = router;

