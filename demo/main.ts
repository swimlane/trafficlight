import * as Koa from 'koa';
import * as Router from 'koa-router';
const body = require('koa-better-body');

import { ProfileController, SwaggerController } from './controllers';
import { bindRoutes } from 'trafficlight';

export function setupKoa() {
    const app = new Koa();

    app.use(body());

    buildRoutes(app);

    /**
     * Serve swagger
     */
    const koaSwagger = require('koa2-swagger-ui');
    app.use(koaSwagger({
        routePrefix: '/swagger', // host at /swagger instead of default /docs
        swaggerOptions: {
            // TODO: default path is not working :-(
            url: 'http://localhost:3000/swagger/spec.json', // example path to json
        },
    }));

    app.listen(3000);
    console.info('server listen 3000 port');
    return app;
}

function buildRoutes(app: any) {
    const routerRoutes = new Router();

    // any router can be used, we support koa-router out of the box
    bindRoutes(routerRoutes, [ProfileController, SwaggerController]);

    // if you are using with some sort of DI system you can pass
    // a third parameter callback to get the instance vs new ctrl.
    // bindRoutes(routerRoutes, [ProfileController], (ctrl) => injector.get(ctrl));

    app.use(routerRoutes.routes());
    app.use(routerRoutes.allowedMethods());
}
setupKoa();