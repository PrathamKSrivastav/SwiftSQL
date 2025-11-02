/**
 * Send success response
 */
export const sendSuccess = (res, statusCode, data, message = null) => {
  const response = {
    status: 'success',
    ...(message && { message }),
    data,
  };

  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    status: 'error',
    message,
    ...(errors && { errors }),
  };

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = (res, statusCode, data, pagination) => {
  const response = {
    status: 'success',
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  };

  res.status(statusCode).json(response);
};
