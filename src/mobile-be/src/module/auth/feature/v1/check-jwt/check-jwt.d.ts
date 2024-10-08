import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { JwtDto } from 'building-blocks/passport/jwt-thirty.guard';
export declare class CheckJwtHandler {
    private readonly amqpConnection;
    private logger;
    constructor(amqpConnection: AmqpConnection);
    checkJwtGuard(command: JwtDto): Promise<any>;
    checkAdminGuard(command: JwtDto): Promise<any>;
}
