declare const _default: {
    env: any;
    serviceName: any;
    port: any;
    rabbitmq: {
        host: any;
        port: any;
        username: any;
        password: any;
        exchange: any;
        uri: any;
    };
    redis: {
        host: any;
        port: any;
    };
    postgres: {
        host: any;
        port: any;
        username: any;
        password: any;
        database: any;
        synchronize: any;
        autoLoadEntities: any;
        entities: any;
        migrations: any;
        logging: any;
        migrationsRun: any;
    };
    jwt: {
        secret: any;
        accessExpirationHours: any;
        refreshExpirationDays: any;
    };
    retry: {
        count: any;
        factor: any;
        minTimeout: any;
        maxTimeout: any;
    };
    monitoring: {
        jaegerEndpoint: any;
        zipkinEndpoint: any;
    };
    mail: {
        mailHost: any;
        user: any;
        pass: any;
        from: any;
        otpExpired: any;
    };
};
export default _default;
