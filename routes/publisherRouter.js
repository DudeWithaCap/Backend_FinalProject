const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorLogger');
const publisherController = require('../controllers/publisherController');

router.get('/', verifyToken, asyncHandler(publisherController.getAllPublishers));
router.get('/:id', verifyToken, asyncHandler(publisherController.getPublisherById));

router.post('/', verifyToken, isAdmin, asyncHandler(publisherController.createPublisher));
router.put('/:id', verifyToken, isAdmin, asyncHandler(publisherController.updatePublisher));
router.delete('/:id', verifyToken, isAdmin, asyncHandler(publisherController.deletePublisher));

module.exports = router;
