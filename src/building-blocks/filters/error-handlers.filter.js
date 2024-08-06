"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ErrorHandlersFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlersFilter = void 0;
const common_1 = require("@nestjs/common");
const http_problem_details_1 = require("http-problem-details");
const joi_1 = require("joi");
const application_exception_1 = require("../types/exceptions/application.exception");
const serilization_1 = require("../utils/serilization");
let ErrorHandlersFilter = ErrorHandlersFilter_1 = class ErrorHandlersFilter {
    constructor() {
        this.logger = new common_1.Logger(ErrorHandlersFilter_1.name);
    }
    catch(err, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let problem;
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        if (err instanceof application_exception_1.ApplicationException) {
            problem = this.createProblemDocument(application_exception_1.ApplicationException.name, err.message, err.stack, err.statusCode);
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        else if (err instanceof common_1.BadRequestException) {
            problem = this.createProblemDocument(common_1.BadRequestException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        else if (err instanceof common_1.UnauthorizedException) {
            problem = this.createProblemDocument(common_1.UnauthorizedException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.UNAUTHORIZED;
        }
        else if (err instanceof common_1.ConflictException) {
            problem = this.createProblemDocument(common_1.ConflictException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.CONFLICT;
        }
        else if (err instanceof common_1.HttpException) {
            problem = this.createProblemDocument(common_1.HttpException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.CONFLICT;
        }
        else if (err instanceof joi_1.ValidationError) {
            problem = this.createProblemDocument(joi_1.ValidationError.name, err.message, err.stack, common_1.HttpStatus.BAD_REQUEST);
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        else {
            problem = this.createProblemDocument('UnknownError', 'An unexpected error occurred', err.stack, statusCode);
        }
        response.status(statusCode).json(problem);
        this.logger.error((0, serilization_1.serializeObject)(problem));
    }
    createProblemDocument(type, title, detail, status) {
        return new http_problem_details_1.ProblemDocument({
            type,
            title,
            detail,
            status
        });
    }
};
exports.ErrorHandlersFilter = ErrorHandlersFilter;
exports.ErrorHandlersFilter = ErrorHandlersFilter = ErrorHandlersFilter_1 = __decorate([
    (0, common_1.Catch)()
], ErrorHandlersFilter);
//# sourceMappingURL=error-handlers.filter.js.map