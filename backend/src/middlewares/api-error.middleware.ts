import config from '../utils/config'
import { ApiError } from '../utils/api-error';
import { NextFunction, Request, Response } from 'express';

function getErrorMessage(error:Error | Object | string| undefined | null) {
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

export default function errorHandler(error:ApiError|Error , req : Request, res:Response , next:NextFunction){

    if (res.headersSent || config.debug) {
        next(error);
        return;
    }

    if (error instanceof ApiError) {
        res.status(error.statusCode).json({
        error: {
            message: error?.message,
            code: error?.statusCode,
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