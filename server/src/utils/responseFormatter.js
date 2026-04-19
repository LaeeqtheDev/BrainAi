/**
 * Success response formatter
 */
function successResponse(data, message = null) {
    const response = {
      success: true,
    };
  
    if (message) response.message = message;
    if (data) response.data = data;
  
    return response;
  }
  
  /**
   * Error response formatter
   */
  function errorResponse(error, statusCode = 500) {
    return {
      success: false,
      error: error.message || error,
      statusCode,
    };
  }
  
  /**
   * Pagination helper
   */
  function paginateResponse(data, page, limit, total) {
    return {
      success: true,
      data,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  module.exports = {
    successResponse,
    errorResponse,
    paginateResponse,
  };