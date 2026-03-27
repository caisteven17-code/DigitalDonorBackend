/**
 * Shared utility functions across all microservices
 */

const formatResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

const formatError = (error, message = 'An error occurred') => ({
  success: false,
  message,
  error: error.message || error,
});

module.exports = {
  formatResponse,
  formatError,
};
