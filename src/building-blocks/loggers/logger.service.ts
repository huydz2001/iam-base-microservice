import { Injectable } from '@nestjs/common';
import winston, { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggersService {
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = createLogger({
      format: format?.combine(
        format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS' }),
        format.printf(({ message, timestamp }) => {
          return `${timestamp}: ${message}`;
        })
      ),
      transports: [
        new transports.DailyRotateFile({
          filename: 'logs/iam-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '100m',
          maxFiles: '30d'
        })
      ]
    });
  }

  logRequestInfo(info: any) {
    const { method, originalUrl, ip, statusCode, delay } = info;
    this.logger.info(` ${method} ${originalUrl} ${ip} ${statusCode} ${delay}ms`);
  }

  logVerbose(message: string, payloadOpt?: any) {
    this.logger.info(` ${message}${payloadOpt ? '\n' + JSON.stringify(payloadOpt) : ''}`);
  }

  logError(error: any, options?: any) {
    const { message, stack, response } = error;
    this.logger.error(
      `==============\n${options || message}\n${stack}\n${response?.data?.message || response}`
    );
  }

  logErrorTitle(title: string) {
    this.logger.error(`==============Error: ${title}`);
  }
}
