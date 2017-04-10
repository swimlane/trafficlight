"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
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
        target[`${ROUTE_PREFIX}${propertyKey}`] = { method, path };
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
        for (const fn of params) {
            let result;
            if (fn !== undefined)
                result = fn(ctx);
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
 * @param {(ctrl) => any} getter
 * @returns {*}
 */
function bindRoutes(routerRoutes, controllers, getter) {
    for (const ctrl of controllers) {
        const routes = ctrl.prototype.$routes;
        for (const { method, url, middleware, fnName } of routes) {
            routerRoutes[method](url, ...middleware, function (ctx, next) {
                return __awaiter(this, void 0, void 0, function* () {
                    const inst = getter === undefined ?
                        new ctrl() : getter(ctrl);
                    const params = ctrl.prototype.$params[fnName];
                    const args = getArguments(params, ctx, next);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxNQUFNLGFBQWEsR0FBVyxVQUFVLENBQUM7QUFDekMsTUFBTSxZQUFZLEdBQVcsU0FBUyxDQUFDO0FBQ3ZDLE1BQU0sU0FBUyxHQUFXLEtBQUssQ0FBQztBQUNoQyxNQUFNLFlBQVksR0FBRztJQUNuQixJQUFJLEVBQUUsTUFBTTtJQUNaLEdBQUcsRUFBRSxLQUFLO0lBQ1YsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLEdBQUcsRUFBRSxLQUFLO0NBQ1gsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxvQkFBMkIsT0FBZSxFQUFFO0lBQzFDLE1BQU0sQ0FBQyxVQUFTLE1BQU07UUFDcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUMvQixNQUFNLE1BQU0sR0FBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVwQixLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixHQUFHLENBQUEsQ0FBQyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJ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LE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDdEMsR0FBRyxDQUFBLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDeEQsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsRUFBRSxVQUFlLEdBQUcsRUFBRSxJQUFJOztvQkFDL0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLFNBQVM7d0JBQy9CLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUU1QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUNyQyxFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUM7d0JBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQztvQkFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQzthQUFBLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN0QixDQUFDO0FBakJELGdDQWlCQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBBUkFNU19QUkVGSVg6IHN0cmluZyA9ICckcGFyYW1zXyc7XG5jb25zdCBST1VURV9QUkVGSVg6IHN0cmluZyA9ICckcm91dGVfJztcbmNvbnN0IE1XX1BSRUZJWDogc3RyaW5nID0gJyRtdyc7XG5jb25zdCBBQ1RJT05fVFlQRVMgPSB7XG4gIEhFQUQ6ICdoZWFkJyxcbiAgR0VUOiAnZ2V0JyxcbiAgUE9TVDogJ3Bvc3QnLFxuICBQVVQ6ICdwdXQnLFxuICBERUxFVEU6ICdkZWxldGUnLFxuICBPUFRJT05TOiAnb3B0aW9ucycsXG4gIEFMTDogJ2FsbCdcbn07XG5cbi8qKlxuICogQ2xhc3MgZGVjb3JhdG9yIGZvciBjb250cm9sbGVyIGRlY2xhcmF0aW9uXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcignL3Byb2ZpbGUnKVxuICogICAgZXhwb3J0IGNsYXNzIFByb2ZpbGVDb250cm9sbGVyIHtcbiAqICAgICAgLi4uXG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPScnXVxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbnRyb2xsZXIocGF0aDogc3RyaW5nID0gJycpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGNvbnN0IHByb3RvID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICBjb25zdCBwcm90b3MgPSAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pO1xuICAgIGNvbnN0IG13cyA9IHRhcmdldFtNV19QUkVGSVhdIHx8IFtdO1xuICAgIHRhcmdldC4kcGF0aCA9IHBhdGg7XG5cbiAgICBwcm90by4kcm91dGVzID0gW107XG4gICAgZm9yKGNvbnN0IHByb3Agb2YgcHJvdG9zKSB7XG4gICAgICBpZihwcm9wLmluZGV4T2YoUk9VVEVfUFJFRklYKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBmbk5hbWUgPSBwcm9wLnN1YnN0cmluZyhST1VURV9QUkVGSVgubGVuZ3RoKTtcbiAgICAgICAgY29uc3Qgcm91dGUgPSBwcm90b1twcm9wXTtcbiAgICAgICAgY29uc3QgZm5Nd3MgPSBwcm90b1tgJHtNV19QUkVGSVh9XyR7Zm5OYW1lfWBdIHx8IFtdO1xuXG4gICAgICAgIHByb3RvLiRyb3V0ZXMucHVzaCh7XG4gICAgICAgICAgbWV0aG9kOiByb3V0ZS5tZXRob2QsXG4gICAgICAgICAgdXJsOiBwYXRoICsgcm91dGUucGF0aCxcbiAgICAgICAgICBtaWRkbGV3YXJlOiBbLi4ubXdzLCAuLi5mbk13c10sXG4gICAgICAgICAgZm5OYW1lXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHByb3RvLiRwYXJhbXMgPSB7fTtcbiAgICBmb3IoY29uc3QgcHJvcCBvZiBwcm90b3MpIHtcbiAgICAgIGlmKHByb3AuaW5kZXhPZihQQVJBTVNfUFJFRklYKSA9PT0gMCkge1xuICAgICAgICBjb25zdCB7IGluZGV4LCBuYW1lLCBmbiB9ID0gcHJvdG9bcHJvcF07XG4gICAgICAgIGlmKCFwcm90by4kcGFyYW1zW25hbWVdKSBwcm90by4kcGFyYW1zW25hbWVdID0gW107XG4gICAgICAgIHByb3RvLiRwYXJhbXNbbmFtZV1baW5kZXhdID0gZm47XG4gICAgICB9XG4gICAgfVxuICB9O1xufTtcblxuLyoqXG4gKiBNaWRkbGV3YXJlKHMpIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgQFVzZShteU1pZGRsZXdhcmUpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqXG4gKiAgICAgIEBHZXQoKVxuICogICAgICBAVXNlKG15TWlkZGxld2FyZTIpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqXG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHBhcmFtIHsuLi5BcnJheTwoKSA9PiB2b2lkPn0gbWlkZGxld2FyZXNcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVc2UoLi4ubWlkZGxld2FyZXM6IEFycmF5PCgpID0+IHZvaWQ+KSB7XG4gIHJldHVybiAodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pID0+IHtcbiAgICBpZighcHJvcGVydHlLZXkpIHtcbiAgICAgIHByb3BlcnR5S2V5ID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3BlcnR5S2V5ID0gJ18nICsgcHJvcGVydHlLZXk7XG4gICAgfVxuXG4gICAgdGFyZ2V0W2Ake01XX1BSRUZJWH0ke3Byb3BlcnR5S2V5fWBdID0gbWlkZGxld2FyZXM7XG4gIH07XG59XG5cbi8qKlxuICogUm91dGUgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBSb3V0ZSgnZ2V0JylcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ11cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSb3V0ZShtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nID0gJycpIHtcbiAgcmV0dXJuICh0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PikgPT4ge1xuICAgIHRhcmdldFtgJHtST1VURV9QUkVGSVh9JHtwcm9wZXJ0eUtleX1gXSA9IHsgbWV0aG9kLCBwYXRoIH07XG4gIH07XG59O1xuXG4vKipcbiAqIEdldCBtZXRob2QgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQEdldCgpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXQocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLkdFVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIFBvc3QgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQb3N0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5QT1NULCBwYXRoKTtcbn07XG5cbi8qKlxuICogUHV0IG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUHV0KClcbiAqICAgICAgcHV0KCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1dChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUFVULCBwYXRoKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBARGVsZXRlKClcbiAqICAgICAgZGVsZXRlKCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZShwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuREVMRVRFLCBwYXRoKTtcbn07XG5cbi8qKlxuICogQm9keSBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEJvZHkoKSBteUJvZHkpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQm9keSgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgdGFyZ2V0W2Ake1BBUkFNU19QUkVGSVh9JHtwcm9wZXJ0eUtleX1gXSA9IHtcbiAgICAgIGluZGV4LFxuICAgICAgbmFtZTogcHJvcGVydHlLZXksXG4gICAgICBmbjogKGN0eCkgPT4ge1xuICAgICAgICByZXR1cm4gY3R4LnJlcXVlc3QuZmllbGRzO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogSW5qZWN0IHV0aWxpdHkgbWV0aG9kXG4gKlxuICogQHBhcmFtIHthbnl9IGZuXG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBJbmplY3QoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgdGFyZ2V0W2Ake1BBUkFNU19QUkVGSVh9JHtpbmRleH1fJHtwcm9wZXJ0eUtleX1gXSA9IHtcbiAgICAgIGluZGV4LFxuICAgICAgbmFtZTogcHJvcGVydHlLZXksXG4gICAgICBmblxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogS09BIGNvbnRleHQgY29uc3RydWN0b3IgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBDdHgoKSBjdHgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gQ3R4KCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eCk7XG59XG5cbi8qKlxuICogTm9kZSByZXF1ZXN0IG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlcSgpIHJlcSkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXEoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcSk7XG59XG5cbi8qKlxuICogS09BIHJlcXVlc3Qgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXF1ZXN0YC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlcXVlc3QoKSByZXF1ZXN0KSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3QoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QpO1xufVxuXG4vKipcbiAqIE5vZGUgcmVzcG9uc2Ugb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXNgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUmVzKCkgcmVzKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlcygpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVzKTtcbn1cblxuLyoqXG4gKiBLT0EgcmVzcG9uc2Ugb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXNwb25zZWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBSZXNwb25zZSgpIHJlc3BvbnNlKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlc3BvbnNlKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXNwb25zZSk7XG59XG5cbi8qKlxuICogRmlsZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc1swXWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWxlKCkgbXlGaWxlKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpbGUoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKGN0eC5yZXF1ZXN0LmZpbGVzLmxlbmd0aCkgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpbGVzWzBdO1xuICAgIHJldHVybiBjdHgucmVxdWVzdC5maWxlcztcbiAgfSk7XG59XG5cbi8qKlxuICogRmlsZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc2AuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWxlcygpIGZpbGVzKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpbGVzKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0LmZpbGVzKTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbSBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucXVlcnlbJ2lkJ11gLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbSgnaWQnKSBpZCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVyeVBhcmFtKHByb3A/KSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKCFwcm9wKSByZXR1cm4gY3R4LnF1ZXJ5O1xuICAgIHJldHVybiBjdHgucXVlcnlbcHJvcF07XG4gIH0pO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucXVlcnlgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbXMoKSBhbGxQYXJhbXMpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbXMoKSB7XG4gIHJldHVybiBRdWVyeVBhcmFtKCk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW0gY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnBhcmFtc1tteXZhcl1gLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KCc6aWQnKVxuICogICAgICBwb3N0KEBQYXJhbSgnaWQnKSBpZCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQYXJhbShwcm9wPykge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZighcHJvcCkgcmV0dXJuIGN0eC5wYXJhbXM7XG4gICAgcmV0dXJuIGN0eC5wYXJhbXNbcHJvcF07XG4gIH0pO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucGFyYW1zYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgnOmlkLzpuYW1lJylcbiAqICAgICAgcG9zdChAUGFyYW1zKCkgb2JqKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtcygpIHtcbiAgcmV0dXJuIFBhcmFtKCk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIHBhcmFtcywgZXhlY3V0ZSBlYWNoIHdpdGggdGhlIGNvbnRleHQuXG4gKiBcbiAqIEBwYXJhbSBwYXJhbXMgXG4gKiBAcGFyYW0gY3R4IFxuICogQHBhcmFtIG5leHQgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmd1bWVudHMocGFyYW1zLCBjdHgsIG5leHQpOiBhbnlbXSB7XG4gIGxldCBhcmdzID0gW2N0eCwgbmV4dF07XG5cbiAgaWYocGFyYW1zKSB7XG4gICAgYXJncyA9IFtdO1xuICAgIGZvcihjb25zdCBmbiBvZiBwYXJhbXMpIHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZihmbiAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSBmbihjdHgpO1xuICAgICAgYXJncy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogQmluZHMgdGhlIHJvdXRlcyB0byB0aGUgcm91dGVyXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gKiAgICBiaW5kUm91dGVzKHJvdXRlciwgW1Byb2ZpbGVDb250cm9sbGVyXSk7XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7Kn0gcm91dGVyUm91dGVzIFxuICogQHBhcmFtIHthbnlbXX0gY29udHJvbGxlcnMgXG4gKiBAcGFyYW0geyhjdHJsKSA9PiBhbnl9IGdldHRlciBcbiAqIEByZXR1cm5zIHsqfSBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRSb3V0ZXMocm91dGVyUm91dGVzOiBhbnksIGNvbnRyb2xsZXJzOiBhbnlbXSwgZ2V0dGVyOiAoY3RybCkgPT4gYW55KTogYW55IHtcbiAgZm9yKGNvbnN0IGN0cmwgb2YgY29udHJvbGxlcnMpIHtcbiAgICBjb25zdCByb3V0ZXMgPSBjdHJsLnByb3RvdHlwZS4kcm91dGVzO1xuICAgIGZvcihjb25zdCB7IG1ldGhvZCwgdXJsLCBtaWRkbGV3YXJlLCBmbk5hbWUgfSBvZiByb3V0ZXMpIHtcbiAgICAgIHJvdXRlclJvdXRlc1ttZXRob2RdKHVybCwgLi4ubWlkZGxld2FyZSwgYXN5bmMgZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IGluc3QgPSBnZXR0ZXIgPT09IHVuZGVmaW5lZCA/IFxuICAgICAgICAgIG5ldyBjdHJsKCkgOiBnZXR0ZXIoY3RybCk7XG5cbiAgICAgICAgY29uc3QgcGFyYW1zID0gY3RybC5wcm90b3R5cGUuJHBhcmFtc1tmbk5hbWVdO1xuICAgICAgICBjb25zdCBhcmdzID0gZ2V0QXJndW1lbnRzKHBhcmFtcywgY3R4LCBuZXh0KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gaW5zdFtmbk5hbWVdKC4uLmFyZ3MpO1xuICAgICAgICBpZihyZXN1bHQpIGN0eC5ib2R5ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3V0ZXJSb3V0ZXM7XG59XG4iXX0=