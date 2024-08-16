import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Response } from 'express';
import { ProblemDocument } from 'http-problem-details';
import { ValidationError } from 'joi';
import { LoggersService } from '../loggers/logger.service';
import { ApplicationException } from '../types/exceptions/application.exception';
import HttpClientException from '../types/exceptions/http-client.exception';
import { serializeObject } from '../utils/serilization';

@Catch()
export class ErrorHandlersFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorHandlersFilter.name);
  private readonly loggerService = new LoggersService();
  catch(err: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let problem: ProblemDocument;
    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    // ApplicationException
    if (err instanceof ApplicationException) {
      problem = this.createProblemDocument(
        ApplicationException.name,
        err.message,
        err.stack,
        err.statusCode
      );
      statusCode = HttpStatus.BAD_REQUEST;
    }
    // BadRequestException
    else if (err.constructor.name == 'BadRequestException') {
      problem = this.createProblemDocument(
        BadRequestException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.BAD_REQUEST;
    }
    // UnauthorizedException
    else if (err.constructor.name == 'UnauthorizedException') {
      problem = this.createProblemDocument(
        UnauthorizedException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.UNAUTHORIZED;
    }
    // ConflictException
    else if (err.constructor.name == 'ConflictException') {
      problem = this.createProblemDocument(
        ConflictException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.CONFLICT;
    }
    // NotFoundException
    else if (err.constructor.name == 'NotFoundException') {
      problem = this.createProblemDocument(
        NotFoundException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.NOT_FOUND;
    }
    // ForbidenException
    else if (err.constructor.name == 'ForbiddenException') {
      problem = this.createProblemDocument(
        ForbiddenException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.FORBIDDEN;
    }
    // HttpClientException
    else if (err instanceof HttpClientException) {
      problem = this.createProblemDocument(
        HttpClientException.name,
        err.message,
        err.stack,
        err.statusCode
      );
      statusCode = HttpStatus.CONFLICT;
    }
    // HttpException
    else if (err.constructor.name == 'HttpException') {
      problem = this.createProblemDocument(
        HttpException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.CONFLICT;
    }
    //  ValidationError
    else if (err.constructor.name == 'ValidationError') {
      problem = this.createProblemDocument(
        ValidationError.name,
        err.message,
        err.stack,
        HttpStatus.BAD_REQUEST
      );
      statusCode = HttpStatus.BAD_REQUEST;
    }
    // Handle other types of exceptions or fallback
    else {
      problem = this.createProblemDocument(
        'UnknownError',
        'An unexpected error occurred',
        err.stack,
        statusCode
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { detail, ...prolem } = problem;
    const resp = {
      success: false,
      code: statusCode,
      message: problem.type,
      data: {
        message: problem.title
      }
    };

    response.status(statusCode).json(resp);
    this.logger.error(serializeObject(problem));
  }

  private createProblemDocument(
    type: string,
    title: string,
    detail: string,
    status: number
  ): ProblemDocument {
    return new ProblemDocument({
      status,
      type,
      title,
      detail
    });
  }
}
