function errorHandler(err, req, res, next) { console.error(err);

  // set default status code to 500
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message,
    statusCode: statusCode,
  });
}

export default errorHandler;
