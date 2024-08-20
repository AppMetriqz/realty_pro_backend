import { HttpException, HttpStatus } from '@nestjs/common';
import * as _ from 'lodash';
import { Request } from 'express';
import * as fs from 'fs-extra';

export default function ExceptionResponse(
  exception: HttpException,
  request: Request,
) {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let error: unknown = 'Internal Server Error';
  let message: unknown = '';
  try {
    const file = request.file;
    if (file) {
      fs.remove(file.path);
    }

    if (_.isFunction(exception.getStatus)) {
      statusCode = exception?.getStatus();
    }

    let Exception: any = exception;
    const errName = Exception.name;
    const isValidationErr = _.isArray(Exception.errors);
    const isForeignKeyErr = errName === 'SequelizeForeignKeyConstraintError';
    const isDatabaseErr = errName === 'SequelizeDatabaseError';
    const isGetResponse = _.isFunction(exception.getResponse);

    if (isValidationErr) {
      message = _.map(Exception.errors, 'message');
    } else if (isForeignKeyErr || isDatabaseErr) {
      message = Exception.message;
      // save on sentry: Exception.parameters
    } else if (isGetResponse) {
      Exception = exception.getResponse();
      if (_.isString(Exception)) {
        message = Exception;
      } else if (
        _.isString(Exception.message) ||
        _.isArray(Exception.message)
      ) {
        error = Exception.error;
        message = Exception.message;
      }
    } else {
      message = Exception.message;
    }

    return {
      statusCode: statusCode,
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  } catch (e) {
    return {
      statusCode: statusCode,
      error: '--Internal Server Error--',
      message: e.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }
}
