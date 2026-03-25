const userService = require('./userService');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile };
