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

  const targetRole = role || 'BUYER';
  const existingUser = await userService.getUserByEmail(email);

  if (existingUser) {
    // Check if the user already has this role
    if (existingUser.roles.includes(targetRole)) {
      throw new Error('User with this role already exists');
    }

    // Update existing user with the new role and potentially update other fields
    const updatedRoles = [...existingUser.roles, targetRole];
    const updatedUser = await userService.updateUser(existingUser.id, {
      roles: updatedRoles,
      // Update other fields if they are provided in the new signup
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

  // Create new user if not exists
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
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    companyName: newUser.companyName,
    email: newUser.email,
    roles: newUser.roles,
  };
};

const loginUser = async (email, password, role) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // If user has multiple roles and hasn't selected one yet
  if (user.roles.length > 1 && !role) {
    return {
      needRoleSelection: true,
      roles: user.roles,
    };
  }

  // Determine active role (either the provided one or the only one available)
  const activeRole = role || user.roles[0];

  // Validate that the user actually has the selected role
  if (!user.roles.includes(activeRole)) {
    throw new Error('Invalid role selected');
  }

  const token = jwt.sign({ id: user.id, role: activeRole }, env.JWT_SECRET, { expiresIn: '1d' });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: activeRole,
      roles: user.roles,
    },
  };
};

module.exports = { registerUser, loginUser };
