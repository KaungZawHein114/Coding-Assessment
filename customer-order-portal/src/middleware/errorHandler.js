// Shows the 404 (not found), 403 (forbidden) and 500 (server error) pages.

function notFound(req, res, next) {
  const err = new Error('The page you requested could not be found.');
  err.status = 404;
  next(err);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  if (err.type === 'entity.too.large') status = 413;
  if (status >= 500) console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  if (res.headersSent) return next(err);

  const view = [403, 404, 429].includes(status) ? `errors/${status}` : 'errors/500';
  const isServerError = status >= 500;
  res.status(status);
  res.render(view, {
    title: { 403: 'Forbidden', 404: 'Not found', 429: 'Too many attempts' }[status] || 'Something went wrong',
    message: isServerError ? null : err.message,
  });
}

module.exports = { notFound, errorHandler };
