const User = require('../models/user');

async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({}, { password: 0 });
    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    if (req.userRole !== 'admin' && req.userId !== req.params.id) {
      const err = new Error('Unauthorized');
      err.status = 403;
      return next(err);
    }

    const user = await User.findById(req.params.id, { password: 0 });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    res.json({
      message: 'User retrieved successfully',
      user
    });
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      const err = new Error('Invalid role. Must be "user" or "admin"');
      err.status = 400;
      return next(err);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    res.json({
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    res.json({
      message: 'User deleted successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};
