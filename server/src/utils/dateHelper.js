/**
 * Get date range for analytics
 */
function getDateRange(period) {
    const endDate = new Date();
    const startDate = new Date();
  
    switch (period) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
  
    return { startDate, endDate };
  }
  
  /**
   * Format timestamp to readable date
   */
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  /**
   * Check if two dates are the same day
   */
  function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
  
  /**
   * Get day of week
   */
  function getDayOfWeek(date) {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  }
  
  module.exports = {
    getDateRange,
    formatDate,
    isSameDay,
    getDayOfWeek,
  };