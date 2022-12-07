import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as log4js from 'log4js';

const logger = log4js.getLogger(`cheese`);

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const pchars: string[] = [`%3E`, `%3C`, `%2F`, `<`, `/`, `>`];
    let message = exception.message;
    logger.warn(`http-exception.filter: HttpExceptionFilter: ${exception}`);
    if (message) {
      if (pchars.some(v => message.includes(v))) {
        message = ``;
      }
    }
    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}