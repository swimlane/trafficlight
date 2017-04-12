"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require("reflect-metadata");
const PARAMS_PREFIX = '$params';
const ROUTE_PREFIX = '$routes';
const MW_PREFIX = '$mw';
const PATH = '$path';
const ACTION_TYPES = {
    HEAD: 'head',
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    OPTIONS: 'options',
    ALL: 'all'
};
/**
 * Class decorator for controller declaration
 *
 * Example:
 *
 *    @Controller('/profile')
 *    export class ProfileController {
 *      ...
 *    }
 *
 * @export
 * @param {string} [path='']
 * @returns
 */
function Controller(path = '') {
    return function (target) {
        const proto = target.prototype;
        // get middlewares
        const mws = Reflect.getMetadata(MW_PREFIX, target) || [];
        // get routes
        const routeDefs = Reflect.getMetadata(ROUTE_PREFIX, proto) || [];
        const routes = [];
        for (const route of routeDefs) {
            const fnMws = Reflect.getMetadata(`${MW_PREFIX}_${route.name}`, proto) || [];
            const params = Reflect.getMetadata(`${PARAMS_PREFIX}_${route.name}`, proto) || [];
            routes.push({
                method: route.method,
                url: path + route.path,
                middleware: [...mws, ...fnMws],
                name: route.name,
                params
            });
        }
        Reflect.defineMetadata(ROUTE_PREFIX, routes, target);
    };
}
exports.Controller = Controller;
;
/**
 * Middleware(s) decorator
 *
 * Example:
 *
 *    @Controller()
 *    @Use(myMiddleware)
 *    export class MyController {
 *
 *      @Get()
 *      @Use(myMiddleware2)
 *      get() { ... }
 *
 *    }
 *
 * @export
 * @param {...Array<() => void>} middlewares
 * @returns
 */
function Use(...middlewares) {
    return (target, propertyKey, descriptor) => {
        if (!propertyKey) {
            propertyKey = '';
        }
        else {
            propertyKey = '_' + propertyKey;
        }
        Reflect.defineMetadata(`${MW_PREFIX}${propertyKey}`, middlewares, target);
    };
}
exports.Use = Use;
/**
 * Route method decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Route('get')
 *      get() { ... }
 *    }
 *
 * @export
 * @param {string} method
 * @param {string} [path='']
 * @returns
 */
function Route(method, path = '') {
    return (target, name, descriptor) => {
        const meta = Reflect.getMetadata(ROUTE_PREFIX, target) || [];
        meta.push({ method, path, name });
        Reflect.defineMetadata(ROUTE_PREFIX, meta, target);
    };
}
exports.Route = Route;
;
/**
 * Get method decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Get()
 *      get() { ... }
 *    }
 *
 */
function Get(path) {
    return Route(ACTION_TYPES.GET, path);
}
exports.Get = Get;
;
/**
 * Post method decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post() { ... }
 *    }
 *
 */
function Post(path) {
    return Route(ACTION_TYPES.POST, path);
}
exports.Post = Post;
;
/**
 * Put method decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Put()
 *      put() { ... }
 *    }
 *
 */
function Put(path) {
    return Route(ACTION_TYPES.PUT, path);
}
exports.Put = Put;
;
/**
 * Delete method decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Delete()
 *      delete() { ... }
 *    }
 *
 */
function Delete(path) {
    return Route(ACTION_TYPES.DELETE, path);
}
exports.Delete = Delete;
;
/**
 * Inject utility method
 *
 * @export
 * @param {any} fn
 * @returns
 */
function Inject(fn) {
    return function (target, name, index) {
        const meta = Reflect.getMetadata(`${PARAMS_PREFIX}_${name}`, target) || [];
        meta.push({ index, name, fn });
        Reflect.defineMetadata(`${PARAMS_PREFIX}_${name}`, meta, target);
    };
}
exports.Inject = Inject;
/**
 * KOA context constructor decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Ctx() ctx) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Ctx() {
    return Inject((ctx) => ctx);
}
exports.Ctx = Ctx;
/**
 * Node request object constructor decorator. This is a
 * shortcut for `ctx.req`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Req() req) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Req() {
    return Inject((ctx) => ctx.req);
}
exports.Req = Req;
/**
 * KOA request object constructor decorator. This is a
 * shortcut for `ctx.request`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Request() request) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Request() {
    return Inject((ctx) => ctx.request);
}
exports.Request = Request;
/**
 * Node response object constructor decorator. This is a
 * shortcut for `ctx.res`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Res() res) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Res() {
    return Inject((ctx) => ctx.res);
}
exports.Res = Res;
/**
 * KOA response object constructor decorator. This is a
 * shortcut for `ctx.response`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Response() response) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Response() {
    return Inject((ctx) => ctx.response);
}
exports.Response = Response;
/**
 * Body constructor decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Body() myBody) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Body() {
    return Inject((ctx) => ctx.request.body);
}
exports.Body = Body;
/**
 * Fields constructor decorator
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Fields() myFields) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Fields() {
    return Inject((ctx) => ctx.request.fields);
}
exports.Fields = Fields;
/**
 * File object constructor decorator. This is a
 * shortcut for `ctx.req.files[0]`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@File() myFile) { ... }
 *    }
 *
 * @export
 * @returns
 */
function File() {
    return Inject((ctx) => {
        if (ctx.request.files.length)
            return ctx.request.files[0];
        return ctx.request.files;
    });
}
exports.File = File;
/**
 * File object constructor decorator. This is a
 * shortcut for `ctx.req.files`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Files() files) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Files() {
    return Inject((ctx) => ctx.request.files);
}
exports.Files = Files;
/**
 * Query param constructor decorator. This is a
 * shortcut for example: `ctx.query['id']`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@QueryParam('id') id) { ... }
 *    }
 *
 * @export
 * @returns
 */
function QueryParam(prop) {
    return Inject((ctx) => {
        if (!prop)
            return ctx.query;
        return ctx.query[prop];
    });
}
exports.QueryParam = QueryParam;
/**
 * Query params constructor decorator. This is a
 * shortcut for example: `ctx.query`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@QueryParams() allParams) { ... }
 *    }
 *
 * @export
 * @returns
 */
function QueryParams() {
    return QueryParam();
}
exports.QueryParams = QueryParams;
/**
 * Query param constructor decorator. This is a
 * shortcut for example: `ctx.params[myvar]`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post(':id')
 *      post(@Param('id') id) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Param(prop) {
    return Inject((ctx) => {
        if (!prop)
            return ctx.params;
        return ctx.params[prop];
    });
}
exports.Param = Param;
/**
 * Query params constructor decorator. This is a
 * shortcut for example: `ctx.params`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post(':id/:name')
 *      post(@Params() obj) { ... }
 *    }
 *
 * @export
 * @returns
 */
function Params() {
    return Param();
}
exports.Params = Params;
/**
 * Given a list of params, execute each with the context.
 *
 * @param params
 * @param ctx
 * @param next
 */
function getArguments(params, ctx, next) {
    let args = [ctx, next];
    if (params) {
        args = [];
        // sort by index
        params.sort((a, b) => {
            return a.index - b.index;
        });
        for (const param of params) {
            let result;
            if (param !== undefined)
                result = param.fn(ctx);
            args.push(result);
        }
    }
    return args;
}
exports.getArguments = getArguments;
/**
 * Binds the routes to the router
 *
 * Example:
 *
 *    const router = new Router();
 *    bindRoutes(router, [ProfileController]);
 *
 * @export
 * @param {*} routerRoutes
 * @param {any[]} controllers
 * @param {(ctrl) => any} [getter]
 * @returns {*}
 */
function bindRoutes(routerRoutes, controllers, getter) {
    for (const ctrl of controllers) {
        const routes = Reflect.getMetadata(ROUTE_PREFIX, ctrl);
        for (const { method, url, middleware, name, params } of routes) {
            routerRoutes[method](url, ...middleware, function (ctx, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const inst = getter === undefined ?
                        new ctrl() : getter(ctrl);
                    const args = getArguments(params, ctx, next);
                    const result = inst[name](...args);
                    if (result)
                        ctx.body = yield result;
                    return result;
                });
            });
        }
    }
    return routerRoutes;
}
exports.bindRoutes = bindRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSw0QkFBMEI7QUFFMUIsTUFBTSxhQUFhLEdBQVcsU0FBUyxDQUFDO0FBQ3hDLE1BQU0sWUFBWSxHQUFXLFNBQVMsQ0FBQztBQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUM7QUFDaEMsTUFBTSxJQUFJLEdBQVcsT0FBTyxDQUFDO0FBQzdCLE1BQU0sWUFBWSxHQUFHO0lBQ25CLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixJQUFJLEVBQUUsTUFBTTtJQUNaLEdBQUcsRUFBRSxLQUFLO0lBQ1YsTUFBTSxFQUFFLFFBQVE7SUFDaEIsT0FBTyxFQUFFLFNBQVM7SUFDbEIsR0FBRyxFQUFFLEtBQUs7Q0FDWCxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILG9CQUEyQixPQUFlLEVBQUU7SUFDMUMsTUFBTSxDQUFDLFVBQVMsTUFBTTtRQUNwQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRS9CLGtCQUFrQjtRQUNsQixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFekQsYUFBYTtRQUNiLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFbEIsR0FBRyxDQUFBLENBQUMsTUFBTSxLQUFLLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsU0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0UsTUFB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V0FBa0IsRUFBRSxNQUFzQjtJQUN0RixHQUFHLENBQUEsQ0FBQyxNQUFNLElBQUksSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZELEdBQUcsQ0FBQSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5RCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxFQUFFLFVBQWUsR0FBRyxFQUFFLElBQUk7O29CQUMvRCxNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssU0FBUzt3QkFDL0IsSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTVCLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDbkMsRUFBRSxDQUFBLENBQUMsTUFBTSxDQUFDO3dCQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7b0JBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2hCLENBQUM7YUFBQSxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQWpCRCxnQ0FpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ3JlZmxlY3QtbWV0YWRhdGEnO1xuXG5jb25zdCBQQVJBTVNfUFJFRklYOiBzdHJpbmcgPSAnJHBhcmFtcyc7XG5jb25zdCBST1VURV9QUkVGSVg6IHN0cmluZyA9ICckcm91dGVzJztcbmNvbnN0IE1XX1BSRUZJWDogc3RyaW5nID0gJyRtdyc7XG5jb25zdCBQQVRIOiBzdHJpbmcgPSAnJHBhdGgnO1xuY29uc3QgQUNUSU9OX1RZUEVTID0ge1xuICBIRUFEOiAnaGVhZCcsXG4gIEdFVDogJ2dldCcsXG4gIFBPU1Q6ICdwb3N0JyxcbiAgUFVUOiAncHV0JyxcbiAgREVMRVRFOiAnZGVsZXRlJyxcbiAgT1BUSU9OUzogJ29wdGlvbnMnLFxuICBBTEw6ICdhbGwnXG59O1xuXG4vKipcbiAqIENsYXNzIGRlY29yYXRvciBmb3IgY29udHJvbGxlciBkZWNsYXJhdGlvblxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoJy9wcm9maWxlJylcbiAqICAgIGV4cG9ydCBjbGFzcyBQcm9maWxlQ29udHJvbGxlciB7XG4gKiAgICAgIC4uLlxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ11cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb250cm9sbGVyKHBhdGg6IHN0cmluZyA9ICcnKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBjb25zdCBwcm90byA9IHRhcmdldC5wcm90b3R5cGU7XG5cbiAgICAvLyBnZXQgbWlkZGxld2FyZXNcbiAgICBjb25zdCBtd3MgPSBSZWZsZWN0LmdldE1ldGFkYXRhKE1XX1BSRUZJWCwgdGFyZ2V0KSB8fCBbXTtcblxuICAgIC8vIGdldCByb3V0ZXNcbiAgICBjb25zdCByb3V0ZURlZnMgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFJPVVRFX1BSRUZJWCwgcHJvdG8pIHx8IFtdO1xuICAgIGNvbnN0IHJvdXRlcyA9IFtdO1xuXG4gICAgZm9yKGNvbnN0IHJvdXRlIG9mIHJvdXRlRGVmcykge1xuICAgICAgY29uc3QgZm5Nd3MgPSBSZWZsZWN0LmdldE1ldGFkYXRhKGAke01XX1BSRUZJWH1fJHtyb3V0ZS5uYW1lfWAsIHByb3RvKSB8fCBbXTtcbiAgICAgIGNvbnN0IHBhcmFtcyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoYCR7UEFSQU1TX1BSRUZJWH1fJHtyb3V0ZS5uYW1lfWAsIHByb3RvKSB8fCBbXTtcblxuICAgICAgcm91dGVzLnB1c2goe1xuICAgICAgICBtZXRob2Q6IHJvdXRlLm1ldGhvZCxcbiAgICAgICAgdXJsOiBwYXRoICsgcm91dGUucGF0aCxcbiAgICAgICAgbWlkZGxld2FyZTogWy4uLm13cywgLi4uZm5Nd3NdLFxuICAgICAgICBuYW1lOiByb3V0ZS5uYW1lLFxuICAgICAgICBwYXJhbXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoUk9VVEVfUFJFRklYLCByb3V0ZXMsIHRhcmdldCk7XG4gIH07XG59O1xuXG4vKipcbiAqIE1pZGRsZXdhcmUocykgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBAVXNlKG15TWlkZGxld2FyZSlcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICpcbiAqICAgICAgQEdldCgpXG4gKiAgICAgIEBVc2UobXlNaWRkbGV3YXJlMilcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICpcbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0gey4uLkFycmF5PCgpID0+IHZvaWQ+fSBtaWRkbGV3YXJlc1xuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVzZSguLi5taWRkbGV3YXJlczogQXJyYXk8KCkgPT4gdm9pZD4pIHtcbiAgcmV0dXJuICh0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PikgPT4ge1xuICAgIGlmKCFwcm9wZXJ0eUtleSkge1xuICAgICAgcHJvcGVydHlLZXkgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcGVydHlLZXkgPSAnXycgKyBwcm9wZXJ0eUtleTtcbiAgICB9XG5cbiAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKGAke01XX1BSRUZJWH0ke3Byb3BlcnR5S2V5fWAsIG1pZGRsZXdhcmVzLCB0YXJnZXQpO1xuICB9O1xufVxuXG4vKipcbiAqIFJvdXRlIG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUm91dGUoJ2dldCcpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge3N0cmluZ30gW3BhdGg9JyddXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUm91dGUobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyA9ICcnKSB7XG4gIHJldHVybiAodGFyZ2V0OiBhbnksIG5hbWU6IHN0cmluZywgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PikgPT4ge1xuICAgIGNvbnN0IG1ldGEgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFJPVVRFX1BSRUZJWCwgdGFyZ2V0KSB8fCBbXTtcbiAgICBtZXRhLnB1c2goeyBtZXRob2QsIHBhdGgsIG5hbWUgfSk7XG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShST1VURV9QUkVGSVgsIG1ldGEsIHRhcmdldCk7XG4gIH07XG59O1xuXG4vKipcbiAqIEdldCBtZXRob2QgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQEdldCgpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXQocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLkdFVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIFBvc3QgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQb3N0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5QT1NULCBwYXRoKTtcbn07XG5cbi8qKlxuICogUHV0IG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUHV0KClcbiAqICAgICAgcHV0KCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1dChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUFVULCBwYXRoKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBARGVsZXRlKClcbiAqICAgICAgZGVsZXRlKCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZShwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuREVMRVRFLCBwYXRoKTtcbn07XG5cbi8qKlxuICogSW5qZWN0IHV0aWxpdHkgbWV0aG9kXG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7YW55fSBmbiBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gSW5qZWN0KGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgbmFtZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgY29uc3QgbWV0YSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoYCR7UEFSQU1TX1BSRUZJWH1fJHtuYW1lfWAsIHRhcmdldCkgfHwgW107XG4gICAgbWV0YS5wdXNoKHsgaW5kZXgsIG5hbWUsIGZuIH0pO1xuICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoYCR7UEFSQU1TX1BSRUZJWH1fJHtuYW1lfWAsIG1ldGEsIHRhcmdldCk7XG4gIH07XG59XG5cbi8qKlxuICogS09BIGNvbnRleHQgY29uc3RydWN0b3IgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBDdHgoKSBjdHgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQ3R4KCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eCk7XG59XG5cbi8qKlxuICogTm9kZSByZXF1ZXN0IG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlcSgpIHJlcSkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXEoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcSk7XG59XG5cbi8qKlxuICogS09BIHJlcXVlc3Qgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXF1ZXN0YC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlcXVlc3QoKSByZXF1ZXN0KSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3QoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QpO1xufVxuXG4vKipcbiAqIE5vZGUgcmVzcG9uc2Ugb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXNgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUmVzKCkgcmVzKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlcygpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVzKTtcbn1cblxuLyoqXG4gKiBLT0EgcmVzcG9uc2Ugb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXNwb25zZWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBSZXNwb25zZSgpIHJlc3BvbnNlKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc3BvbnNlKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXNwb25zZSk7XG59XG5cbi8qKlxuICogQm9keSBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEJvZHkoKSBteUJvZHkpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQm9keSgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxdWVzdC5ib2R5KTtcbn1cblxuLyoqXG4gKiBGaWVsZHMgY29uc3RydWN0b3IgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWVsZHMoKSBteUZpZWxkcykgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWVsZHMoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QuZmllbGRzKTtcbn1cblxuLyoqXG4gKiBGaWxlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxLmZpbGVzWzBdYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEZpbGUoKSBteUZpbGUpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRmlsZSgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoY3R4LnJlcXVlc3QuZmlsZXMubGVuZ3RoKSByZXR1cm4gY3R4LnJlcXVlc3QuZmlsZXNbMF07XG4gICAgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpbGVzO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGaWxlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxLmZpbGVzYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEZpbGVzKCkgZmlsZXMpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRmlsZXMoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QuZmlsZXMpO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5xdWVyeVsnaWQnXWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBRdWVyeVBhcmFtKCdpZCcpIGlkKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXJ5UGFyYW0ocHJvcD8pIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoIXByb3ApIHJldHVybiBjdHgucXVlcnk7XG4gICAgcmV0dXJuIGN0eC5xdWVyeVtwcm9wXTtcbiAgfSk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW1zIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5xdWVyeWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBRdWVyeVBhcmFtcygpIGFsbFBhcmFtcykgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVyeVBhcmFtcygpIHtcbiAgcmV0dXJuIFF1ZXJ5UGFyYW0oKTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbSBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucGFyYW1zW215dmFyXWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoJzppZCcpXG4gKiAgICAgIHBvc3QoQFBhcmFtKCdpZCcpIGlkKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtKHByb3A/KSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKCFwcm9wKSByZXR1cm4gY3R4LnBhcmFtcztcbiAgICByZXR1cm4gY3R4LnBhcmFtc1twcm9wXTtcbiAgfSk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW1zIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5wYXJhbXNgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KCc6aWQvOm5hbWUnKVxuICogICAgICBwb3N0KEBQYXJhbXMoKSBvYmopIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUGFyYW1zKCkge1xuICByZXR1cm4gUGFyYW0oKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIGxpc3Qgb2YgcGFyYW1zLCBleGVjdXRlIGVhY2ggd2l0aCB0aGUgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gcGFyYW1zXG4gKiBAcGFyYW0gY3R4XG4gKiBAcGFyYW0gbmV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXJndW1lbnRzKHBhcmFtcywgY3R4LCBuZXh0KTogYW55W10ge1xuICBsZXQgYXJncyA9IFtjdHgsIG5leHRdO1xuXG4gIGlmKHBhcmFtcykge1xuICAgIGFyZ3MgPSBbXTtcbiAgICBcbiAgICAvLyBzb3J0IGJ5IGluZGV4XG4gICAgcGFyYW1zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcblxuICAgIGZvcihjb25zdCBwYXJhbSBvZiBwYXJhbXMpIHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZihwYXJhbSAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSBwYXJhbS5mbihjdHgpO1xuICAgICAgYXJncy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogQmluZHMgdGhlIHJvdXRlcyB0byB0aGUgcm91dGVyXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gKiAgICBiaW5kUm91dGVzKHJvdXRlciwgW1Byb2ZpbGVDb250cm9sbGVyXSk7XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7Kn0gcm91dGVyUm91dGVzIFxuICogQHBhcmFtIHthbnlbXX0gY29udHJvbGxlcnMgXG4gKiBAcGFyYW0geyhjdHJsKSA9PiBhbnl9IFtnZXR0ZXJdIFxuICogQHJldHVybnMgeyp9IFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFJvdXRlcyhyb3V0ZXJSb3V0ZXM6IGFueSwgY29udHJvbGxlcnM6IGFueVtdLCBnZXR0ZXI/OiAoY3RybCkgPT4gYW55KTogYW55IHtcbiAgZm9yKGNvbnN0IGN0cmwgb2YgY29udHJvbGxlcnMpIHtcbiAgICBjb25zdCByb3V0ZXMgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFJPVVRFX1BSRUZJWCwgY3RybCk7XG5cbiAgICBmb3IoY29uc3QgeyBtZXRob2QsIHVybCwgbWlkZGxld2FyZSwgbmFtZSwgcGFyYW1zIH0gb2Ygcm91dGVzKSB7XG4gICAgICByb3V0ZXJSb3V0ZXNbbWV0aG9kXSh1cmwsIC4uLm1pZGRsZXdhcmUsIGFzeW5jIGZ1bmN0aW9uKGN0eCwgbmV4dCkge1xuICAgICAgICBjb25zdCBpbnN0ID0gZ2V0dGVyID09PSB1bmRlZmluZWQgPyBcbiAgICAgICAgICBuZXcgY3RybCgpIDogZ2V0dGVyKGN0cmwpO1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXRBcmd1bWVudHMocGFyYW1zLCBjdHgsIG5leHQpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBpbnN0W25hbWVdKC4uLmFyZ3MpO1xuICAgICAgICBpZihyZXN1bHQpIGN0eC5ib2R5ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3V0ZXJSb3V0ZXM7XG59XG4iXX0=