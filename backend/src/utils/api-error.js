class ApiError extends Error {
  message;
  statusCode;
  constructor(statusCode , message) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}

export {ApiError};