const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const userService = require('../users/userService');
const sellerService = require('../sellers/sellerService');

const registerUser = async (data) => {
  const { 
    email, password, name, firstName, lastName, 
    companyName, category, businessScale, gstNumber, role 
  } = data;

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const finalFirstName = firstName || (name ? name.split(' ')[0] : undefined);
  const finalLastName = lastName || (name ? name.split(' ').slice(1).join(' ') : undefined);

  const targetRole = role || 'BUYER';
  const existingUser = await userService.getUserByEmail(email);

  if (existingUser) {
    if (existingUser.roles.includes(targetRole)) {
      throw new Error('User with this role already exists');
    }

    const updatedRoles = [...existingUser.roles, targetRole];
    const updatedUser = await userService.updateUser(existingUser.id, {
      roles: updatedRoles,
      firstName: finalFirstName || existingUser.firstName,
      lastName: finalLastName || existingUser.lastName,
      companyName: companyName || existingUser.companyName,
      category: category || existingUser.category,
      businessScale: businessScale || existingUser.businessScale,
      gstNumber: gstNumber || existingUser.gstNumber,
    });

    if (targetRole === 'SELLER') {
      await sellerService.upsertSellerFromUser(updatedUser, {
        businessName: companyName || updatedUser.companyName || `${finalFirstName || ''} ${finalLastName || ''}`.trim() || email,
        displayName: companyName || updatedUser.companyName || `${finalFirstName || ''} ${finalLastName || ''}`.trim() || email,
        contactEmail: email,
      });
    }

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
    firstName: finalFirstName,
    lastName: finalLastName,
    companyName,
    roles: [targetRole],
    category,
    businessScale,
    gstNumber,
  });

  if (targetRole === 'SELLER') {
    await sellerService.upsertSellerFromUser(newUser, {
      businessName: companyName || `${finalFirstName || ''} ${finalLastName || ''}`.trim() || email,
      displayName: companyName || `${finalFirstName || ''} ${finalLastName || ''}`.trim() || email,
      contactEmail: email,
    });
  }

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
