class ApiError extends Error {
  message;
  statusCode;
  constructor(statusCode:number , message:string) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}

export {ApiError};