import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Response } from 'express';
import { ProblemDocument } from 'http-problem-details';
import { ValidationError } from 'joi';
import { ApplicationException } from '../types/exceptions/application.exception';
import { serializeObject } from '../utils/serilization';
import HttpClientException from '../types/exceptions/http-client.exception';

@Catch()
export class ErrorHandlersFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorHandlersFilter.name);
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
      status,
      type,
      title,
      detail
    });
  }
}
