import { HttpException, HttpStatus } from '@nestjs/common';
import { Error } from 'sequelize';
import { ExceptionDto } from '../dto/http-exception-filter.dto';
import { StatusCodes } from '../constants';

export class CatchException {
  ServerError(error: any) {
    const errorMessage =
      error?.response?.error || error?.cause || error.message;

    const errors = error?.errors?.map((errorItem: Error) => {
      return errorItem.message;
    });

    throw new HttpException(
      {
        status: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        error: errorMessage,
        errors: errors,
      },
      error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      { cause: error },
    );
  }

  ServiceUnavailable() {
    throw new HttpException(
      {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        error: '503 Service Unavailable',
      },
      503,
      { cause: '503 Service Unavailable' },
    );
  }

  NotFound() {
    throw new HttpException(
      {
        statusCode: StatusCodes.NotFound.statusCode,
        error: StatusCodes.NotFound.error,
        message: StatusCodes.NotFound.message,
      },
      HttpStatus.NOT_FOUND,
      {
        cause: StatusCodes.NotFound.error,
        description: StatusCodes.NotFound.message,
      },
    );
  }

  BadRequest(message: string) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: StatusCodes.BadRequest.error,
        message: message,
      },
      HttpStatus.BAD_REQUEST,
      {
        cause: message,
      },
    );
  }

  Error({ statusCode, error, message }: ExceptionDto) {
    throw new HttpException(
      {
        status: statusCode,
        error: error,
        message: message,
      },
      statusCode,
      { cause: error, description: message },
    );
  }
}
