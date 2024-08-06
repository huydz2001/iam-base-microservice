"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigData = void 0;
const common_1 = require("@nestjs/common");
let ConfigData = class ConfigData {
    createData(entity, userId) {
        entity.createdAt = new Date();
        entity.updatedAt = new Date();
        entity.deletedBy = null;
        entity.createdBy = userId;
        entity.updatedBy = userId;
        entity.isDeleted = false;
        return entity;
    }
    updateData(entity, userId) {
        entity.updatedAt = new Date();
        entity.updatedBy = userId;
        return entity;
    }
    deleteData(entity, userId) {
        entity.isDeleted = true;
        entity.deletedBy = userId;
        entity.updatedAt = new Date();
        return entity;
    }
};
exports.ConfigData = ConfigData;
exports.ConfigData = ConfigData = __decorate([
    (0, common_1.Injectable)()
], ConfigData);
//# sourceMappingURL=config-data.js.map