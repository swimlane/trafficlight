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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const trafficlight_1 = require("trafficlight");
const tsoa_custom_decorators_1 = require("tsoa-custom-decorators");
let ProfileController = class ProfileController {
    getAll(filter) {
        return [];
    }
    getOne(id) {
        return {};
    }
    create(body) {
        return {};
    }
    upload(id, file) {
        // return {}
    }
    update(id, body) {
        return {};
    }
    destroy(id) {
        // return success
    }
};
__decorate([
    trafficlight_1.Get(),
    __param(0, tsoa_custom_decorators_1.Query('filter')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ProfileController.prototype, "getAll", null);
__decorate([
    trafficlight_1.Get('/:id'),
    __param(0, trafficlight_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ProfileController.prototype, "getOne", null);
__decorate([
    trafficlight_1.Post(),
    __param(0, trafficlight_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], ProfileController.prototype, "create", null);
__decorate([
    trafficlight_1.Post('/:id/upload'),
    __param(0, trafficlight_1.Param('id')), __param(1, trafficlight_1.File()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "upload", null);
__decorate([
    trafficlight_1.Put('/:id'),
    __param(0, trafficlight_1.Param('id')), __param(1, trafficlight_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], ProfileController.prototype, "update", null);
__decorate([
    trafficlight_1.Delete('/:id'),
    __param(0, trafficlight_1.Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProfileController.prototype, "destroy", null);
ProfileController = __decorate([
    trafficlight_1.Controller('/profile')
], ProfileController);
exports.ProfileController = ProfileController;
const swagger = require('./swagger.json');
let SwaggerController = class SwaggerController {
    getSpec() {
        return JSON.stringify(swagger, null, 4);
    }
};
__decorate([
    trafficlight_1.Get('/spec.json'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], SwaggerController.prototype, "getSpec", null);
SwaggerController = __decorate([
    trafficlight_1.Controller('/swagger')
], SwaggerController);
exports.SwaggerController = SwaggerController;
//# sourceMappingURL=controllers.js.map