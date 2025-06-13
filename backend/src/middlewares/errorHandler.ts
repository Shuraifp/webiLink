import { NextFunction, Request, Response } from 'express';
import {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError
} from '../utils/errors';
import logger from '../utils/logger';

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    logger.error('Error:', err);

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