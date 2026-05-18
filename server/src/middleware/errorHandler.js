const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;

  const isDevelopment = process.env.NODE_ENV !== 'production';

  const message = (status === 500 && !isDevelopment)
    ? 'An internal server error occurred'
    : err.message || 'An error occurred';

  const response = { success: false, message };

  if (isDevelopment && err.stack) {
    response.stack = err.stack;
  }

  return res.status(status).json(response);
};

module.exports = { errorHandler };
