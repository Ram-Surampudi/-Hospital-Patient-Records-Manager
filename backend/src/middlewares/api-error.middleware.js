import config from '../utils/config.js'
import { ApiError } from '../utils/api-error.js';

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  if (typeof error === "string") {
    return error;
  }
  return "An error occurred";
}

export default function errorHandler(error , req, res , next){

    if (res.headersSent || config.debug) {
        next(error);
        return;
    }

    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
        error: {
            message: error.message,
            code: error.code,
        },
        });
        return;
    }

    res.status(500).json({
        error: {
        message:
            getErrorMessage(error) ||
            "An error occurred. Please view logs for more details",
        },
    });
}