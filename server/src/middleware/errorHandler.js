/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
    console.error(' Global Error:', err);
  
    // Firebase errors
    if (err.code && err.code.includes('auth/')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication error',
        details: err.message,
      });
    }
  
    // Validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: err.message,
      });
    }
  
    // Default server error
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  }
  
  /**
   * 404 handler
   */
  function notFoundHandler(req, res) {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.path,
    });
  }
  
  module.exports = {
    errorHandler,
    notFoundHandler,
  };