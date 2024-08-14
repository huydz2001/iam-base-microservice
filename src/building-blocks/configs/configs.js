"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const joi_1 = __importDefault(require("joi"));
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), `.env.${nodeEnv}`) });
dotenv_1.default.config({ override: true });
const envVarsSchema = joi_1.default.object()
    .keys({
    NODE_ENV: joi_1.default.string().required(),
    SERVICE_NAME: joi_1.default.string(),
    PORT: joi_1.default.number().default(3000),
    JWT_SECRET: joi_1.default.string()
        .default('thisisafakesecretchangeit')
        .required()
        .description('JWT secret key'),
    JWT_SECRET_REFRESH: joi_1.default.string()
        .default('anhhuydzvodich')
        .required()
        .description('JWT refresh secret key'),
    JWT_ACCESS_EXPIRATION_HOUR: joi_1.default.number()
        .default('6h')
        .description('hours after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: joi_1.default.string()
        .default('7 days')
        .description('days after which refresh tokens expire'),
    POSTGRES_HOST: joi_1.default.string().default('localhost').description('Postgres host'),
    POSTGRES_PORT: joi_1.default.number().default(5432).description('Postgres host'),
    POSTGRES_USERNAME: joi_1.default.string().default('postgres').description('Postgres username'),
    POSTGRES_PASSWORD: joi_1.default.string().default('postgres').description('Postgres password'),
    POSTGRES_DB: joi_1.default.string().default('default_database').description('Postgres database name'),
    POSTGRES_SYNCHRONIZE: joi_1.default.boolean()
        .default(false)
        .description('Synchronize if true it dosent use migrations'),
    POSTGRES_AUTO_LOAD_ENTITIES: joi_1.default.boolean()
        .default(true)
        .description('For loading all entities automatically'),
    POSTGRES_ENTITIES: joi_1.default.string().description('Postgres entities'),
    POSTGRES_MIGRATIONS: joi_1.default.string().description('Postgres migrations'),
    POSTGRES_LOGGING: joi_1.default.boolean().default(false).description('Postgres logging'),
    POSTGRES_MIGRATIONS_RUN: joi_1.default.boolean()
        .default(false)
        .description('Run migrations after running project'),
    REDIS_HOST: joi_1.default.string().default('localhost').description('Redis host'),
    REDIS_PORT: joi_1.default.number().default(6379).description('Redis port'),
    RABBITMQ_Host: joi_1.default.string().default('localhost').description('Rabbitmq host'),
    RABBITMQ_PORT: joi_1.default.number().default(5672).description('Rabbitmq port'),
    RABBITMQ_USERNAME: joi_1.default.string().default('guest').description('Rabbitmq username'),
    RABBITMQ_PASSWORD: joi_1.default.string().default('guest').description('Rabbitmq password'),
    RABBITMQ_EXCHANGE: joi_1.default.string().description('Rabbitmq exchange'),
    RABBITMQ_URI: joi_1.default.string().description('Rabbitmq uri'),
    RETRY_COUNT: joi_1.default.number().default(3).description('Number of retries'),
    RETRY_FACTOR: joi_1.default.number().default(2).description('Exponential backoff factor'),
    RETRY_MIN_TIMEOUT: joi_1.default.number()
        .default(1000)
        .description('Minimum time before retrying (1 second)'),
    RETRY_MAX_TIMEOUT: joi_1.default.number()
        .default(60000)
        .description('Maximum time before retrying (60 seconds)'),
    MONITORING_JAEGER_ENDPOINT: joi_1.default.string()
        .default('http://localhost:14268/api/traces')
        .description('Jaeger Endpoint'),
    MONITORING_ZIPKIN_ENDPOINT: joi_1.default.string()
        .default('http://zipkin-server:9411/api/v2/spans')
        .description('Zipkin Endpoint'),
    MAIL_HOST: joi_1.default.string().default('smtp.gmail.com').description('Mail host'),
    MAIL_USER: joi_1.default.string().default('huyydq01@gmail.com').description('Mail user'),
    MAIL_PASSWORD: joi_1.default.string().description('Mail password'),
    MAIL_FROM: joi_1.default.string().default('huyydq01@gmail.com').description('Mail from'),
    OTP_EXPIRED: joi_1.default.number().default(60).description('Otp expired')
})
    .unknown();
const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    .validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
exports.default = {
    env: envVars.NODE_ENV,
    serviceName: envVars.SERVICE_NAME,
    port: envVars.PORT,
    rabbitmq: {
        host: envVars.RABBITMQ_Host,
        port: envVars.RABBITMQ_PORT,
        username: envVars.RABBITMQ_USERNAME,
        password: envVars.RABBITMQ_PASSWORD,
        exchange: envVars.RABBITMQ_EXCHANGE,
        uri: envVars.RABBITMQ_URI
    },
    redis: {
        host: envVars.REDIS_HOST,
        port: envVars.REDIS_PORT
    },
    postgres: {
        host: envVars.POSTGRES_HOST,
        port: envVars.POSTGRES_PORT,
        username: envVars.POSTGRES_USERNAME,
        password: envVars.POSTGRES_PASSWORD,
        database: envVars.POSTGRES_DB,
        synchronize: envVars.POSTGRES_SYNCHRONIZE,
        autoLoadEntities: envVars.POSTGRES_AUTO_LOAD_ENTITIES,
        entities: envVars.POSTGRES_ENTITIES,
        migrations: envVars.POSTGRES_MIGRATIONS,
        logging: envVars.POSTGRES_LOGGING,
        migrationsRun: envVars.POSTGRES_MIGRATIONS_RUN
    },
    jwt: {
        secret: envVars.JWT_SECRET,
        accessExpirationHours: envVars.JWT_ACCESS_EXPIRATION_HOURS,
        refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS
    },
    retry: {
        count: envVars.RETRY_COUNT,
        factor: envVars.RETRY_FACTOR,
        minTimeout: envVars.RETRY_MIN_TIMEOUT,
        maxTimeout: envVars.RETRY_MAX_TIMEOUT
    },
    monitoring: {
        jaegerEndpoint: envVars.MONITORING_JAEGER_ENDPOINT,
        zipkinEndpoint: envVars.MONITORING_ZIPKIN_ENDPOINT
    },
    mail: {
        mailHost: envVars.MAIL_HOST,
        user: envVars.MAIL_USER,
        pass: envVars.MAIL_PASSWORD,
        from: envVars.MAIL_FROM,
        otpExpired: envVars.OTP_EXPIRED
    }
};
//# sourceMappingURL=configs.js.map