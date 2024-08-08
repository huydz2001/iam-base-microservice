"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityAuditBase = void 0;
const typeorm_1 = require("typeorm");
const entity_base_abstract_1 = require("./entity_base.abstract");
let EntityAuditBase = class EntityAuditBase extends entity_base_abstract_1.EntityBase {
};
exports.EntityAuditBase = EntityAuditBase;
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EntityAuditBase.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EntityAuditBase.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], EntityAuditBase.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_by' }),
    __metadata("design:type", String)
], EntityAuditBase.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_deleted' }),
    __metadata("design:type", Boolean)
], EntityAuditBase.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, name: 'deleted_by' }),
    __metadata("design:type", String)
], EntityAuditBase.prototype, "deletedBy", void 0);
exports.EntityAuditBase = EntityAuditBase = __decorate([
    (0, typeorm_1.Entity)()
], EntityAuditBase);
//# sourceMappingURL=entity_audit_base.abstract.js.map