const express = require('express');
const authRoutes = require('../modules/auth/authRoutes');
const userRoutes = require('../modules/users/userRoutes');
const productRoutes = require('../modules/products/productRoutes');
const orderRoutes = require('../modules/orders/orderRoutes');
const paymentRoutes = require('../modules/payments/paymentRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
