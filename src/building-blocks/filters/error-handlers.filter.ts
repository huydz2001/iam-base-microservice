import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { Response } from 'express';
import { ProblemDocument } from 'http-problem-details';
import { ValidationError } from 'joi';
import { ApplicationException } from '../types/exceptions/application.exception';
import { serializeObject } from '../utils/serilization';

@Catch()
export class ErrorHandlersFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorHandlersFilter.name);
  public catch(err: any, host: ArgumentsHost) {
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
    else if (err instanceof BadRequestException) {
      problem = this.createProblemDocument(
        BadRequestException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.BAD_REQUEST;
    }
    // UnauthorizedException
    else if (err instanceof UnauthorizedException) {
      problem = this.createProblemDocument(
        UnauthorizedException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.UNAUTHORIZED;
    }
    // ConflictException
    else if (err instanceof ConflictException) {
      problem = this.createProblemDocument(
        ConflictException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.CONFLICT;
    }
    // HttpException
    else if (err instanceof HttpException) {
      problem = this.createProblemDocument(
        HttpException.name,
        err.message,
        err.stack,
        err.getStatus()
      );
      statusCode = HttpStatus.CONFLICT;
    }
    //  ValidationError
    else if (err instanceof ValidationError) {
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

    response.status(statusCode).json(problem);
    this.logger.error(serializeObject(problem));
  }

  private createProblemDocument(
    type: string,
    title: string,
    detail: string,
    status: number
  ): ProblemDocument {
    return new ProblemDocument({
      type,
      title,
      detail,
      status
    });
  }
}
