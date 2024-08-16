"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ErrorHandlersFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandlersFilter = void 0;
const common_1 = require("@nestjs/common");
const http_problem_details_1 = require("http-problem-details");
const joi_1 = require("joi");
const logger_service_1 = require("../loggers/logger.service");
const application_exception_1 = require("../types/exceptions/application.exception");
const http_client_exception_1 = __importDefault(require("../types/exceptions/http-client.exception"));
const serilization_1 = require("../utils/serilization");
let ErrorHandlersFilter = ErrorHandlersFilter_1 = class ErrorHandlersFilter {
    constructor() {
        this.logger = new common_1.Logger(ErrorHandlersFilter_1.name);
        this.loggerService = new logger_service_1.LoggersService();
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
        else if (err.constructor.name == 'BadRequestException') {
            problem = this.createProblemDocument(common_1.BadRequestException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        else if (err.constructor.name == 'UnauthorizedException') {
            problem = this.createProblemDocument(common_1.UnauthorizedException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.UNAUTHORIZED;
        }
        else if (err.constructor.name == 'ConflictException') {
            problem = this.createProblemDocument(common_1.ConflictException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.CONFLICT;
        }
        else if (err.constructor.name == 'NotFoundException') {
            problem = this.createProblemDocument(common_1.NotFoundException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.NOT_FOUND;
        }
        else if (err.constructor.name == 'ForbiddenException') {
            problem = this.createProblemDocument(common_1.ForbiddenException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.FORBIDDEN;
        }
        else if (err instanceof http_client_exception_1.default) {
            problem = this.createProblemDocument(http_client_exception_1.default.name, err.message, err.stack, err.statusCode);
            statusCode = common_1.HttpStatus.CONFLICT;
        }
        else if (err.constructor.name == 'HttpException') {
            problem = this.createProblemDocument(common_1.HttpException.name, err.message, err.stack, err.getStatus());
            statusCode = common_1.HttpStatus.CONFLICT;
        }
        else if (err.constructor.name == 'ValidationError') {
            problem = this.createProblemDocument(joi_1.ValidationError.name, err.message, err.stack, common_1.HttpStatus.BAD_REQUEST);
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        else {
            problem = this.createProblemDocument('UnknownError', 'An unexpected error occurred', err.stack, statusCode);
        }
        const { detail } = problem, prolem = __rest(problem, ["detail"]);
        response.status(statusCode).json(prolem);
        this.logger.error((0, serilization_1.serializeObject)(problem));
    }
    createProblemDocument(type, title, detail, status) {
        return new http_problem_details_1.ProblemDocument({
            status,
            type,
            title,
            detail
        });
    }
};
exports.ErrorHandlersFilter = ErrorHandlersFilter;
exports.ErrorHandlersFilter = ErrorHandlersFilter = ErrorHandlersFilter_1 = __decorate([
    (0, common_1.Catch)()
], ErrorHandlersFilter);
//# sourceMappingURL=error-handlers.filter.js.map