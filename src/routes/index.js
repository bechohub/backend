const express = require('express');
const authRoutes = require('../modules/auth/authRoutes');
const userRoutes = require('../modules/users/userRoutes');
const productRoutes = require('../modules/products/productRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);

module.exports = router;
