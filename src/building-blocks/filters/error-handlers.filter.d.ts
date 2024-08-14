import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ErrorHandlersFilter implements ExceptionFilter {
    private readonly logger;
    private readonly loggerService;
    catch(err: any, host: ArgumentsHost): void;
    private createProblemDocument;
}
