function errorLogger(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  if (err.name === 'ValidationError') status = 400;
  const message = err.message || 'Internal server error';

  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    status,
    stack: err.stack
  });

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : message,
    ...(status === 500 && process.env.NODE_ENV !== 'production' && { error: err.message })
  });
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorLogger, asyncHandler };
