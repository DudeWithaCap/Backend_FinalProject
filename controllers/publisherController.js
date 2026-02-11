const Publisher = require('../models/publisher');

async function getAllPublishers(req, res, next) {
  try {
    const publishers = await Publisher.find();
    res.json(publishers);
  } catch (err) {
    next(err);
  }
}

async function getPublisherById(req, res, next) {
  try {
    const publisher = await Publisher.findById(req.params.id);
    if (!publisher) {
      const err = new Error('Publisher not found');
      err.status = 404;
      return next(err);
    }
    res.json(publisher);
  } catch (err) {
    next(err);
  }
}

async function createPublisher(req, res, next) {
  try {
    const newPublisher = new Publisher(req.body);
    const savedPublisher = await newPublisher.save();
    res.status(201).json(savedPublisher);
  } catch (err) {
    next(err);
  }
}

async function updatePublisher(req, res, next) {
  try {
    const updatedPublisher = await Publisher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPublisher) {
      const err = new Error('Publisher not found');
      err.status = 404;
      return next(err);
    }
    res.json(updatedPublisher);
  } catch (err) {
    next(err);
  }
}

async function deletePublisher(req, res, next) {
  try {
    const deletedPublisher = await Publisher.findByIdAndDelete(req.params.id);
    if (!deletedPublisher) {
      const err = new Error('Publisher not found');
      err.status = 404;
      return next(err);
    }
    res.json({ message: 'Publisher deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher
};
