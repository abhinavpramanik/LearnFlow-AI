/**
 * Standard API response formatters
 */

const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const createdResponse = (res, message, data = {}) => {
  return successResponse(res, message, data, 201);
};

const errorResponse = (res, message, errors = [], statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { successResponse, createdResponse, errorResponse, paginatedResponse };
