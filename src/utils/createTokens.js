const jwt = require('jsonwebtoken');
const JWTSignature = process.env.JWT_SIGNATURE;

module.exports = function (sessionId, userId, res) {
  try {
    // Create Access Token
    const accessToken = jwt.sign(
      {
        sessionId,
        userId,
      },
      JWTSignature
    );
    // Crete Refresh Token
    const refreshToken = jwt.sign(
      {
        sessionId,
      },
      JWTSignature
    );
    // Set tokens
    res
      .cookie('accessToken', accessToken, {
        // maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24, // cookie will be removed after 24 hours
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });
  } catch (error) {
    throw new Error('Could not create tokens.');
  }
};
