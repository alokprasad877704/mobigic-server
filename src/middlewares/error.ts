interface ErrorResponse {
  status: number;
  message: string;
  err_stack?: object;
}

export interface CustomError {
  statusCode?: number;
  customMessage: string;
}

import { Request, Response, NextFunction } from "express";

// Default function is exported to be a middleware and handle all errors
export default (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse: ErrorResponse = {
    status: err.statusCode ? err.statusCode : 500,
    message: err.customMessage ? err.customMessage : "Please contact the ADMIN",
  };
  // If env is dev, send the err stack
  errorResponse.err_stack = err;
  // Send the response to the consumer
  res.status(errorResponse.status).send(errorResponse);
};
