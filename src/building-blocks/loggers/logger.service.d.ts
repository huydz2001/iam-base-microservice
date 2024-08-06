import 'winston-daily-rotate-file';
export declare class LoggersService {
    private readonly logger;
    constructor();
    logRequestInfo(info: any): void;
    logVerbose(message: string, payloadOpt?: any): void;
    logError(error: any, options?: any): void;
    logErrorTitle(title: string): void;
}
