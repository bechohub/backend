const express = require('express');
const { register, login } = require('./authController');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema } = require('./authSchema');

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

module.exports = router;
