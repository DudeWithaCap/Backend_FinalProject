const Order = require('../models/order');
const Book = require('../models/book');

async function addToCart(req, res, next) {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      const err = new Error('bookId is required');
      err.status = 400;
      throw err;
    }

    const book = await Book.findById(bookId);
    if (!book) {
      const err = new Error('Book not found');
      err.status = 404;
      throw err;
    }

    let order = await Order.findOne({ user: req.userId, status: 'active' });

    if (!order) {
      order = new Order({
        user: req.userId,
        books: [bookId]
      });
    } else {
      order.books.push(bookId);
    }

    const savedOrder = await order.save();
    const populated = await savedOrder.populate('books', 'title author genre yearPublished');

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}

async function getMyActiveOrder(req, res, next) {
  try {
    const order = await Order.findOne({
      user: req.userId,
      status: 'active'
    }).populate('books', 'title author genre yearPublished');

    if (!order) {
      return res.status(200).json(null);
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function removeFromCart(req, res, next) {
  try {
    const { bookId } = req.params;

    let order = await Order.findOne({ user: req.userId, status: 'active' });

    if (!order) {
      const err = new Error('No active cart found');
      err.status = 404;
      throw err;
    }

    const originalLength = order.books.length;
    order.books = order.books.filter(
      (id) => id.toString() !== bookId.toString()
    );

    if (order.books.length === originalLength) {
      const err = new Error('Book not found in cart');
      err.status = 404;
      throw err;
    }

    if (order.books.length === 0) {
      await Order.findByIdAndDelete(order._id);
      return res.json({ message: 'Cart is now empty' });
    }

    const savedOrder = await order.save();
    const populated = await savedOrder.populate('books', 'title author genre yearPublished');

    res.json(populated);
  } catch (err) {
    next(err);
  }
}

async function getActiveOrders(req, res, next) {
  try {
    const orders = await Order.find({ status: 'active' })
      .populate('user', 'username email')
      .populate('books', 'title author genre yearPublished');

    res.json(orders);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addToCart,
  getMyActiveOrder,
  removeFromCart,
  getActiveOrders
};

