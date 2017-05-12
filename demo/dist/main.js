"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const body = require('koa-better-body');
const controllers_1 = require("./controllers");
const trafficlight_1 = require("trafficlight");
function setupKoa() {
    const app = new Koa();
    app.use(body());
    buildRoutes(app);
    /**
     * Serve swagger
     */
    const koaSwagger = require('koa2-swagger-ui');
    app.use(koaSwagger({
        routePrefix: '/swagger',
        swaggerOptions: {
            url: 'http://petstore.swagger.io/v3sdagsdg/swagger.json',
        },
    }));
    app.listen(3000);
    console.info('server listen 3000 port');
    return app;
}
exports.setupKoa = setupKoa;
function buildRoutes(app) {
    const routerRoutes = new Router();
    // any router can be used, we support koa-router out of the box
    trafficlight_1.bindRoutes(routerRoutes, [controllers_1.ProfileController, controllers_1.SwaggerController]);
    // if you are using with some sort of DI system you can pass
    // a third parameter callback to get the instance vs new ctrl.
    // bindRoutes(routerRoutes, [ProfileController], (ctrl) => injector.get(ctrl));
    app.use(routerRoutes.routes());
    app.use(routerRoutes.allowedMethods());
}
setupKoa();
//# sourceMappingURL=main.js.map