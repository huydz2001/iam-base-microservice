"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRpcError = exports.ReponseDto = void 0;
const common_1 = require("@nestjs/common");
class ReponseDto {
    constructor(item) {
        Object.assign(this, item);
    }
}
exports.ReponseDto = ReponseDto;
const handleRpcError = (response) => {
    const { name, message } = response;
    switch (name) {
        case 'ForbiddenException':
            throw new common_1.ForbiddenException(message);
        case 'UnauthorizedException':
            throw new common_1.UnauthorizedException(message);
        case 'BadRequestException':
            throw new common_1.BadRequestException(message);
        case 'NotFoundException':
            throw new common_1.NotFoundException(message);
        case 'InternalServerErrorException':
            throw new common_1.InternalServerErrorException(message);
        default:
            throw new common_1.HttpException(message, common_1.HttpStatus.CONFLICT);
    }
};
exports.handleRpcError = handleRpcError;
//# sourceMappingURL=handle-error-rpc.js.map