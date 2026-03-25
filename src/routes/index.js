const express = require('express');
const authRoutes = require('../modules/auth/authRoutes');
const userRoutes = require('../modules/users/userRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
