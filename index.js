"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const PARAMS_PREFIX = '$params_';
const ROUTE_PREFIX = '$route_';
const MW_PREFIX = '$mw';
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
        const protos = Object.getOwnPropertyNames(proto);
        const mws = target[MW_PREFIX] || [];
        target.$path = path;
        proto.$routes = [];
        for (const prop of protos) {
            if (prop.indexOf(ROUTE_PREFIX) === 0) {
                const fnName = prop.substring(ROUTE_PREFIX.length);
                const route = proto[prop];
                const fnMws = proto[`${MW_PREFIX}_${fnName}`] || [];
                proto.$routes.push({
                    method: route.method,
                    url: path + route.path,
                    middleware: [...mws, ...fnMws],
                    fnName
                });
            }
        }
        proto.$params = {};
        for (const prop of protos) {
            if (prop.indexOf(PARAMS_PREFIX) === 0) {
                const { index, name, fn } = proto[prop];
                if (!proto.$params[name])
                    proto.$params[name] = [];
                proto.$params[name][index] = fn;
            }
        }
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
        target[`${MW_PREFIX}${propertyKey}`] = middlewares;
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
    return (target, propertyKey, descriptor) => {
        target[`${ROUTE_PREFIX}${propertyKey}`] = { method, path: path };
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
    return function (target, propertyKey, index) {
        target[`${PARAMS_PREFIX}${propertyKey}`] = {
            index,
            name: propertyKey,
            fn: (ctx) => {
                return ctx.request.fields;
            }
        };
    };
}
exports.Body = Body;
/**
 * Inject utility method
 *
 * @param {any} fn
 * @returns
 */
function Inject(fn) {
    return function (target, propertyKey, index) {
        target[`${PARAMS_PREFIX}${index}_${propertyKey}`] = {
            index,
            name: propertyKey,
            fn
        };
    };
}
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
 * KOA request object constructor decorator. This is a
 * shortcut for `ctx.req`.
 *
 * Example:
 *
 *    @Controller()
 *    export class MyController {
 *      @Post()
 *      post(@Request() req) { ... }
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
function getArguments(ctrl, fnName, ctx, next) {
    let args = [ctx, next];
    const params = ctrl.prototype.$params[fnName];
    if (params) {
        args = [];
        for (const fn of params) {
            let result;
            if (fn !== undefined)
                result = fn(ctx);
            args.push(result);
        }
    }
    return args;
}
/**
 * Binds the routes to the router
 *
 * Example:
 *
 *    const router = new Router();
 *    bindRoutes(router, [ProfileController]);
 *
 * @export
 * @param {any} routerRoutes
 * @param {any} controllers
 * @returns
 */
function bindRoutes(routerRoutes, controllers) {
    for (const ctrl of controllers) {
        const routes = ctrl.prototype.$routes;
        for (const { method, url, middleware, fnName } of routes) {
            routerRoutes[method](url, ...middleware, function (ctx, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const inst = new ctrl();
                    const args = getArguments(ctrl, fnName, ctx, next);
                    const result = inst[fnName](...args);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxhQUFhLEdBQVcsVUFBVSxDQUFDO0FBQ3pDLE1BQU0sWUFBWSxHQUFXLFNBQVMsQ0FBQztBQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUM7QUFDaEMsTUFBTSxZQUFZLEdBQUc7SUFDbkIsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixHQUFHLEVBQUUsS0FBSztDQUNYLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsb0JBQTJCLE9BQWUsRUFBRTtJQUMxQyxNQUFNLENBQUMsVUFBUyxNQUFNO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDL0IsTUFBTSxNQUFNLEdBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsR0FBRyxDQUFBLENBQUMsTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFB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QUFDO29CQUN4QixNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUNyQyxFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUM7d0JBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQztvQkFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQzthQUFBLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN0QixDQUFDO0FBZEQsZ0NBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQQVJBTVNfUFJFRklYOiBzdHJpbmcgPSAnJHBhcmFtc18nO1xuY29uc3QgUk9VVEVfUFJFRklYOiBzdHJpbmcgPSAnJHJvdXRlXyc7XG5jb25zdCBNV19QUkVGSVg6IHN0cmluZyA9ICckbXcnO1xuY29uc3QgQUNUSU9OX1RZUEVTID0ge1xuICBIRUFEOiAnaGVhZCcsXG4gIEdFVDogJ2dldCcsXG4gIFBPU1Q6ICdwb3N0JyxcbiAgUFVUOiAncHV0JyxcbiAgREVMRVRFOiAnZGVsZXRlJyxcbiAgT1BUSU9OUzogJ29wdGlvbnMnLFxuICBBTEw6ICdhbGwnXG59O1xuXG4vKipcbiAqIENsYXNzIGRlY29yYXRvciBmb3IgY29udHJvbGxlciBkZWNsYXJhdGlvblxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcignL3Byb2ZpbGUnKVxuICogICAgZXhwb3J0IGNsYXNzIFByb2ZpbGVDb250cm9sbGVyIHtcbiAqICAgICAgLi4uXG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ10gXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbnRyb2xsZXIocGF0aDogc3RyaW5nID0gJycpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGNvbnN0IHByb3RvID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICBjb25zdCBwcm90b3MgPSAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pO1xuICAgIGNvbnN0IG13cyA9IHRhcmdldFtNV19QUkVGSVhdIHx8IFtdO1xuICAgIHRhcmdldC4kcGF0aCA9IHBhdGg7XG5cbiAgICBwcm90by4kcm91dGVzID0gW107XG4gICAgZm9yKGNvbnN0IHByb3Agb2YgcHJvdG9zKSB7XG4gICAgICBpZihwcm9wLmluZGV4T2YoUk9VVEVfUFJFRklYKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBmbk5hbWUgPSBwcm9wLnN1YnN0cmluZyhST1VURV9QUkVGSVgubGVuZ3RoKTtcbiAgICAgICAgY29uc3Qgcm91dGUgPSBwcm90b1twcm9wXTtcbiAgICAgICAgY29uc3QgZm5Nd3MgPSBwcm90b1tgJHtNV19QUkVGSVh9XyR7Zm5OYW1lfWBdIHx8IFtdO1xuXG4gICAgICAgIHByb3RvLiRyb3V0ZXMucHVzaCh7XG4gICAgICAgICAgbWV0aG9kOiByb3V0ZS5tZXRob2QsXG4gICAgICAgICAgdXJsOiBwYXRoICsgcm91dGUucGF0aCxcbiAgICAgICAgICBtaWRkbGV3YXJlOiBbLi4ubXdzLCAuLi5mbk13c10sXG4gICAgICAgICAgZm5OYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHByb3RvLiRwYXJhbXMgPSB7fTtcbiAgICBmb3IoY29uc3QgcHJvcCBvZiBwcm90b3MpIHtcbiAgICAgIGlmKHByb3AuaW5kZXhPZihQQVJBTVNfUFJFRklYKSA9PT0gMCkge1xuICAgICAgICBjb25zdCB7IGluZGV4LCBuYW1lLCBmbiB9ID0gcHJvdG9bcHJvcF07XG4gICAgICAgIGlmKCFwcm90by4kcGFyYW1zW25hbWVdKSBwcm90by4kcGFyYW1zW25hbWVdID0gW107XG4gICAgICAgIHByb3RvLiRwYXJhbXNbbmFtZV1baW5kZXhdID0gZm47XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuLyoqXG4gKiBNaWRkbGV3YXJlKHMpIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBAVXNlKG15TWlkZGxld2FyZSlcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogXG4gKiAgICAgIEBHZXQoKVxuICogICAgICBAVXNlKG15TWlkZGxld2FyZTIpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqIFxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0gey4uLkFycmF5PCgpID0+IHZvaWQ+fSBtaWRkbGV3YXJlcyBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gVXNlKC4uLm1pZGRsZXdhcmVzOiBBcnJheTwoKSA9PiB2b2lkPikge1xuICByZXR1cm4gKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSA9PiB7XG4gICAgaWYoIXByb3BlcnR5S2V5KSB7XG4gICAgICBwcm9wZXJ0eUtleSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wZXJ0eUtleSA9ICdfJyArIHByb3BlcnR5S2V5O1xuICAgIH1cblxuICAgIHRhcmdldFtgJHtNV19QUkVGSVh9JHtwcm9wZXJ0eUtleX1gXSA9IG1pZGRsZXdhcmVzO1xuICB9O1xufVxuXG4vKipcbiAqIFJvdXRlIG1ldGhvZCBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBSb3V0ZSgnZ2V0JylcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kIFxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPScnXSBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUm91dGUobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyA9ICcnKSB7XG4gIHJldHVybiAodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pID0+IHtcbiAgICB0YXJnZXRbYCR7Uk9VVEVfUFJFRklYfSR7cHJvcGVydHlLZXl9YF0gPSB7IG1ldGhvZCwgcGF0aDogcGF0aCB9O1xuICB9O1xufTtcblxuLyoqXG4gKiBHZXQgbWV0aG9kIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQEdldCgpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5HRVQsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBQb3N0IG1ldGhvZCBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUG9zdChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUE9TVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIFB1dCBtZXRob2QgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUHV0KClcbiAqICAgICAgcHV0KCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdXQocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLlBVVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBtZXRob2QgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBARGVsZXRlKClcbiAqICAgICAgZGVsZXRlKCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGUocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLkRFTEVURSwgcGF0aCk7XG59O1xuXG4vKipcbiAqIEJvZHkgY29uc3RydWN0b3IgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEJvZHkoKSBteUJvZHkpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCb2R5KCkge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICB0YXJnZXRbYCR7UEFSQU1TX1BSRUZJWH0ke3Byb3BlcnR5S2V5fWBdID0ge1xuICAgICAgaW5kZXgsXG4gICAgICBuYW1lOiBwcm9wZXJ0eUtleSxcbiAgICAgIGZuOiAoY3R4KSA9PiB7XG4gICAgICAgIHJldHVybiBjdHgucmVxdWVzdC5maWVsZHM7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBJbmplY3QgdXRpbGl0eSBtZXRob2RcbiAqIFxuICogQHBhcmFtIHthbnl9IGZuIFxuICogQHJldHVybnMgXG4gKi9cbmZ1bmN0aW9uIEluamVjdChmbikge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICB0YXJnZXRbYCR7UEFSQU1TX1BSRUZJWH0ke2luZGV4fV8ke3Byb3BlcnR5S2V5fWBdID0ge1xuICAgICAgaW5kZXgsXG4gICAgICBuYW1lOiBwcm9wZXJ0eUtleSxcbiAgICAgIGZuXG4gICAgfTtcbiAgfTtcbn1cblxuLyoqXG4gKiBLT0EgY29udGV4dCBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAQ3R4KCkgY3R4KSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gQ3R4KCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eCk7XG59XG5cbi8qKlxuICogS09BIHJlcXVlc3Qgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxYC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUmVxdWVzdCgpIHJlcSkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlcSgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxKTtcbn1cblxuLyoqXG4gKiBGaWxlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc1swXWAuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEZpbGUoKSBteUZpbGUpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWxlKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZihjdHgucmVxdWVzdC5maWxlcy5sZW5ndGgpIHJldHVybiBjdHgucmVxdWVzdC5maWxlc1swXTtcbiAgICByZXR1cm4gY3R4LnJlcXVlc3QuZmlsZXM7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZpbGUgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxLmZpbGVzYC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChARmlsZXMoKSBmaWxlcykgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpbGVzKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0LmZpbGVzKTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbSBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnF1ZXJ5WydpZCddYC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbSgnaWQnKSBpZCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXJ5UGFyYW0ocHJvcD8pIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoIXByb3ApIHJldHVybiBjdHgucXVlcnk7XG4gICAgcmV0dXJuIGN0eC5xdWVyeVtwcm9wXTtcbiAgfSk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW1zIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucXVlcnlgLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBRdWVyeVBhcmFtcygpIGFsbFBhcmFtcykgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXJ5UGFyYW1zKCkge1xuICByZXR1cm4gUXVlcnlQYXJhbSgpO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucGFyYW1zW215dmFyXWAuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgnOmlkJylcbiAqICAgICAgcG9zdChAUGFyYW0oJ2lkJykgaWQpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQYXJhbShwcm9wPykge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZighcHJvcCkgcmV0dXJuIGN0eC5wYXJhbXM7XG4gICAgcmV0dXJuIGN0eC5wYXJhbXNbcHJvcF07XG4gIH0pO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnBhcmFtc2AuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgnOmlkLzpuYW1lJylcbiAqICAgICAgcG9zdChAUGFyYW1zKCkgb2JqKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUGFyYW1zKCkge1xuICByZXR1cm4gUGFyYW0oKTtcbn1cblxuZnVuY3Rpb24gZ2V0QXJndW1lbnRzKGN0cmwsIGZuTmFtZSwgY3R4LCBuZXh0KSB7XG4gIGxldCBhcmdzID0gW2N0eCwgbmV4dF07XG4gIGNvbnN0IHBhcmFtcyA9IGN0cmwucHJvdG90eXBlLiRwYXJhbXNbZm5OYW1lXTtcblxuICBpZihwYXJhbXMpIHtcbiAgICBhcmdzID0gW107XG4gICAgZm9yKGNvbnN0IGZuIG9mIHBhcmFtcykge1xuICAgICAgbGV0IHJlc3VsdDtcbiAgICAgIGlmKGZuICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IGZuKGN0eCk7XG4gICAgICBhcmdzLnB1c2gocmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXJncztcbn1cblxuLyoqXG4gKiBCaW5kcyB0aGUgcm91dGVzIHRvIHRoZSByb3V0ZXJcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgY29uc3Qgcm91dGVyID0gbmV3IFJvdXRlcigpO1xuICogICAgYmluZFJvdXRlcyhyb3V0ZXIsIFtQcm9maWxlQ29udHJvbGxlcl0pO1xuICogXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge2FueX0gcm91dGVyUm91dGVzIFxuICogQHBhcmFtIHthbnl9IGNvbnRyb2xsZXJzIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUm91dGVzKHJvdXRlclJvdXRlcywgY29udHJvbGxlcnMpIHtcbiAgZm9yKGNvbnN0IGN0cmwgb2YgY29udHJvbGxlcnMpIHtcbiAgICBjb25zdCByb3V0ZXMgPSBjdHJsLnByb3RvdHlwZS4kcm91dGVzO1xuICAgIGZvcihjb25zdCB7IG1ldGhvZCwgdXJsLCBtaWRkbGV3YXJlLCBmbk5hbWUgfSBvZiByb3V0ZXMpIHtcbiAgICAgIHJvdXRlclJvdXRlc1ttZXRob2RdKHVybCwgLi4ubWlkZGxld2FyZSwgYXN5bmMgZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IGluc3QgPSBuZXcgY3RybCgpO1xuICAgICAgICBjb25zdCBhcmdzID0gZ2V0QXJndW1lbnRzKGN0cmwsIGZuTmFtZSwgY3R4LCBuZXh0KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gaW5zdFtmbk5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICBpZihyZXN1bHQpIGN0eC5ib2R5ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3V0ZXJSb3V0ZXM7XG59XG4iXX0=