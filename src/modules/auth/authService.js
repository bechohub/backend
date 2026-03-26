const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const userService = require('../users/userService');

const registerUser = async (data) => {
  // Destructure all the fields your frontend defined in the Supabase Schema!
  const { 
    email, password, firstName, lastName, 
    companyName, category, businessScale, gstNumber, role 
  } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Double check if the user is already signed up
  const existingUser = await userService.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Scramble the password securely
  const hashedPassword = await bcrypt.hash(password, 10);

  // Safely insert into the database via our service layer
  const newUser = await userService.createUser({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    companyName,
    category,
    businessScale,
    gstNumber,
    role: role || 'BUYER',
  });

  return {
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    companyName: newUser.companyName,
    role: newUser.role,
  };
};

const loginUser = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await userService.getUserByEmail(email);
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  // Compare the raw password to the encrypted one in the DB
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate a stateless token valid for 30 days
  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      companyName: user.companyName,
      role: user.role,
    },
  };
};

module.exports = { registerUser, loginUser };
