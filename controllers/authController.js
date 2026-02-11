const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/user');

async function signup(req, res, next) {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      const err = new Error('All fields are required');
      err.status = 400;
      return next(err);
    }

    if (password !== confirmPassword) {
      const err = new Error('Passwords do not match');
      err.status = 400;
      return next(err);
    }

    if (password.length < 6) {
      const err = new Error('Password must be at least 6 characters');
      err.status = 400;
      return next(err);
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const err = new Error('User with this email or username already exists');
      err.status = 409;
      return next(err);
    }

    const newUser = new User({
      username,
      email,
      password,
      role: 'user'
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      return next(err);
    }

    const user = await User.findOne({ email });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      const err = new Error('Invalid password');
      err.status = 401;
      return next(err);
    }

    // admin users, check if TOTP is required
    if (user.role === 'admin') {
      if (!user.totpEnabled) {
        const tempToken = jwt.sign(
          { userId: user._id, role: user.role, tempAuth: true },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        );

        return res.json({
          message: 'TOTP setup required',
          totpRequired: 'setup',
          tempToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      } else {
        // auth verification for admin
        const tempToken = jwt.sign(
          { userId: user._id, role: user.role, tempAuth: true },
          process.env.JWT_SECRET,
          { expiresIn: '5m' }
        );

        return res.json({
          message: 'TOTP verification required',
          totpRequired: 'verify',
          tempToken,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
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

async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function setupTOTP(req, res, next) {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    if (user.role !== 'admin') {
      const err = new Error('Only admins can set up TOTP');
      err.status = 403;
      return next(err);
    }

    // generate a secret for TOTP
    const secret = speakeasy.generateSecret({
      name: `Bookstore Admin (${user.email})`,
      issuer: 'Bookstore',
      length: 32
    });

    // generating QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      message: 'TOTP secret generated',
      secret: secret.base32,
      qrCode,
      manualEntry: secret.base32
    });
  } catch (err) {
    next(err);
  }
}

async function verifyTOTPSetup(req, res, next) {
  try {
    const { secret, code } = req.body;

    if (!secret || !code) {
      const err = new Error('Secret and code are required');
      err.status = 400;
      return next(err);
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    if (user.role !== 'admin') {
      const err = new Error('Only admins can set up TOTP');
      err.status = 403;
      return next(err);
    }

    // check if code is correct
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code
    });

    if (!verified) {
      const err = new Error('Invalid TOTP code');
      err.status = 400;
      return next(err);
    }

    // if admin already has auth set, dont ask to do it again
    user.totpSecret = secret;
    user.totpEnabled = true;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'TOTP enabled successfully',
      token,
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

async function verifyTOTPLogin(req, res, next) {
  try {
    const { code } = req.body;

    if (!code) {
      const err = new Error('TOTP code is required');
      err.status = 400;
      return next(err);
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    if (!user.totpEnabled || !user.totpSecret) {
      const err = new Error('TOTP not enabled for this user');
      err.status = 400;
      return next(err);
    }

    // verifying code
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code
    });

    if (!verified) {
      const err = new Error('Invalid TOTP code');
      err.status = 401;
      return next(err);
    }

    // JWT token with google auth permission
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
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

module.exports = {
  signup,
  login,
  getMe,
  setupTOTP,
  verifyTOTPSetup,
  verifyTOTPLogin
};
