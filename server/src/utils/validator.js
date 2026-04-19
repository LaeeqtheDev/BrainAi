/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate password strength
   */
  function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
  }
  
  /**
   * Validate required fields
   */
  function validateRequiredFields(data, requiredFields) {
    const missing = [];
  
    requiredFields.forEach(field => {
      if (!data[field]) {
        missing.push(field);
      }
    });
  
    return {
      isValid: missing.length === 0,
      missing,
    };
  }
  
  /**
   * Sanitize user input
   */
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML tags
      .substring(0, 5000); // Limit length
  }
  
  module.exports = {
    isValidEmail,
    isStrongPassword,
    validateRequiredFields,
    sanitizeInput,
  };