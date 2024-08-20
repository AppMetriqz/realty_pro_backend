import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import ExceptionResponse from './exception-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const exceptionsResponse = ExceptionResponse(exception, request);
    const statusCode: number = exceptionsResponse.statusCode;

    response.status(statusCode).json({
      ...exceptionsResponse,
      internal: false,
    });
  }
}
