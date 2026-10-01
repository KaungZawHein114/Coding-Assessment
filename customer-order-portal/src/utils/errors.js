// Custom error types so controllers know what kind of problem happened.
// Domain errors thrown by services and handled by controllers.
class ValidationError extends Error {
  constructor(errors, values = {}) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
    this.values = values;
  }
}

// A business rule was violated (shown to the user as a flash message).
class BusinessError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BusinessError';
  }
}

class NotFoundError extends Error {
  constructor(message = 'The page you requested could not be found.') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

module.exports = { ValidationError, BusinessError, NotFoundError };
