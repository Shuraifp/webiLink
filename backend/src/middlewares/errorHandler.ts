import { Request, Response, NextFunction } from 'express';
import {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError
} from '../utils/errors';

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    console.error('Error:', err);

    if (err instanceof BadRequestError ||
        err instanceof UnauthorizedError ||
        err instanceof ForbiddenError ||
        err instanceof NotFoundError ||
        err instanceof InternalServerError) {
          statusCode = err.statusCode;
          message = err.message;
        }
        else if (err instanceof Error) {
          message = err.message;
        }
        else if (typeof err === 'string') {
          statusCode = 400;
          message = err;
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
};