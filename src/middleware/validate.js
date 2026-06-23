const { ZodError } = require('zod');

/**
 * Validates request data against a Zod schema.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 * @param {'body' | 'query' | 'params'} property - The request property to validate (default: 'body').
 * @returns {import('express').RequestHandler}
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req[property]);
      req[property] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

module.exports = validate;
