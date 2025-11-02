/**
 * Wrapper for async route handlers
 * Catches errors and passes them to Express error handler
 * 
 * Usage:
 * export const myController = catchAsync(async (req, res, next) => {
 *   // Your async code here
 * });
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
