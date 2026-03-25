const authService = require('./authService');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);
    
    res.status(200).json({ success: true, token, data: user });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { register, login };
