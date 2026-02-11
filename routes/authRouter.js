const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorLogger');
const authController = require('../controllers/authController');

router.post('/signup', asyncHandler(authController.signup));
router.post('/login', asyncHandler(authController.login));
router.get('/me', verifyToken, asyncHandler(authController.getMe));

// for google auth
router.get('/totp/setup', verifyToken, asyncHandler(authController.setupTOTP));
router.post('/totp/verify-setup', verifyToken, asyncHandler(authController.verifyTOTPSetup));
router.post('/totp/verify-login', verifyToken, asyncHandler(authController.verifyTOTPLogin));

module.exports = router;
