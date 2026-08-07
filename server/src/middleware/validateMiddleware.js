const { ValidationError } = require('../utils/errors');

/**
 * Middleware factory: validates request body, params, or query using a Zod schema
 * Usage: validate(schema) or validate(schema, 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace parsed source with validated+transformed values
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };
