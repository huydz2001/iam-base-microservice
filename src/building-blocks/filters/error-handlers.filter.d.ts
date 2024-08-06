import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ErrorHandlersFilter implements ExceptionFilter {
    private readonly logger;
    catch(err: any, host: ArgumentsHost): void;
    private createProblemDocument;
}
