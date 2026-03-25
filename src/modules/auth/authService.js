const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const userService = require('../users/userService'); // Cross-module boundary!

const registerUser = async (data) => {
  const {
    email,
    password,
    firstName,
    lastName,
    companyName,
    role,
    category,
    businessScale,
    gstNumber,
  } = data;

  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userService.createUser({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    companyName,
    role: role || 'BUYER',
    category,
    businessScale,
    gstNumber,
  });

  return {
    id: newUser.id,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    companyName: newUser.companyName,
    email: newUser.email,
    role: newUser.role,
  };
};

const loginUser = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '1d' });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { registerUser, loginUser };
