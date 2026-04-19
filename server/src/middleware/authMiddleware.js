const { auth } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 */
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = {
      userId: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error(' Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

/**
 * Optional auth - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(idToken);
      req.user = {
        userId: decodedToken.uid,
        email: decodedToken.email,
      };
    }

    next();
  } catch (error) {
    // Silently fail, user is guest
    next();
  }
}

module.exports = {
  verifyToken,
  optionalAuth,
};