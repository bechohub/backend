const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const userService = require('../users/userService');

const registerUser = async (data) => {
  const { 
    email, password, firstName, lastName, 
    companyName, category, businessScale, gstNumber, role 
  } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const targetRole = role || 'BUYER';
  const existingUser = await userService.getUserByEmail(email);

  if (existingUser) {
    if (existingUser.roles.includes(targetRole)) {
      throw new Error('User with this role already exists');
    }

    const updatedRoles = [...existingUser.roles, targetRole];
    const updatedUser = await userService.updateUser(existingUser.id, {
      roles: updatedRoles,
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      companyName: companyName || existingUser.companyName,
      category: category || existingUser.category,
      businessScale: businessScale || existingUser.businessScale,
      gstNumber: gstNumber || existingUser.gstNumber,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await userService.createUser({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    companyName,
    roles: [targetRole],
    category,
    businessScale,
    gstNumber,
  });

  return {
    id: newUser.id,
    email: newUser.email,
    roles: newUser.roles,
  };
};

const loginUser = async (email, password, role) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await userService.getUserByEmail(email);
  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  if (user.roles.length > 1 && !role) {
    return {
      needRoleSelection: true,
      roles: user.roles,
    };
  }

  const activeRole = role || user.roles[0];
  if (!user.roles.includes(activeRole)) {
    throw new Error('Invalid role selected');
  }

  const token = jwt.sign({ id: user.id, role: activeRole }, env.JWT_SECRET, { expiresIn: '30d' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: activeRole,
      roles: user.roles,
    },
  };
};

module.exports = { registerUser, loginUser };
