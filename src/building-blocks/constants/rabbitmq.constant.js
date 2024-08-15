"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingKey = void 0;
exports.RoutingKey = {
    AUTH: {
        LOGIN: 'LOGIN',
        LOGIN_GUEST: 'LOGIN_GUEST',
        LOGOUT: 'LOGOUT',
        REGISTER: 'REGISTER',
        CHANGE_PASS: 'CHANGE_PASS',
        REFRESH_TOKEN: 'REFRESH_TOKEN',
        CHECK_TOKEN: 'CHECK_TOKEN'
    },
    MOBILE_BE: {
        REGISTER: 'ME_REGISTER',
        LOGIN: 'ME_LOGIN',
        CHANGE_PASS: 'ME_CHANGE_PASS',
        REFRESHTOKEN: 'ME_REFRESH_TOKEN',
        LOGOUT: 'ME_LOGOUT',
        VERIFY_OTP: 'ME_VERIFY_OTP',
        VERIFY_OTP_CHANGE_PASS: 'VERIFY_OTP_CHANGE_PASS',
        CHECK_JWT_TOKEN: 'CHECK_JWT_TOKEN',
        CHECK_ADMIN_GUARD: 'CHECK_ADMN_GUARD',
        CREATE_GROUP: 'CREATE_GROUP',
        UPDATE_GROUP: 'UPDATE_GROUP',
        DEL_GROUP: 'DEL_GROUP',
        GET_GROUPS: 'GET_GROUPS',
        CREATE_MODULE: 'CREATE_MODULE',
        GET_GROUP_BY_ID: 'GET_GROUP_BY_ID',
        GET_MODULE_BY_USER: 'GET_MODULE_BY_USER',
        GET_MODULES: 'GET_MODULES',
        GET_MODULE_BY_GROUP: 'GET_MODULE_BY_GROUP'
    }
};
//# sourceMappingURL=rabbitmq.constant.js.map