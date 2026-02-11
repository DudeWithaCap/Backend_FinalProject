const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorLogger');
const userController = require('../controllers/userController');

router.get('/', verifyToken, isAdmin, asyncHandler(userController.getAllUsers));

router.get('/:id', verifyToken, asyncHandler(userController.getUserById));

router.put('/:id/role', verifyToken, isAdmin, asyncHandler(userController.updateUserRole));

router.delete('/:id', verifyToken, isAdmin, asyncHandler(userController.deleteUser));

module.exports = router;
