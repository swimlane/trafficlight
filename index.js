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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxhQUFhLEdBQVcsVUFBVSxDQUFDO0FBQ3pDLE1BQU0sWUFBWSxHQUFXLFNBQVMsQ0FBQztBQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUM7QUFDaEMsTUFBTSxZQUFZLEdBQUc7SUFDbkIsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixHQUFHLEVBQUUsS0FBSztDQUNYLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsb0JBQTJCLE9BQWUsRUFBRTtJQUMxQyxNQUFNLENBQUMsVUFBUyxNQUFNO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDL0IsTUFBTSxNQUFNLEdBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsR0FBRyxDQUFBLENBQUMsTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFB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QU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztRQUN0QyxHQUFHLENBQUEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN4RCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxFQUFFLFVBQWUsR0FBRyxFQUFFLElBQUk7O29CQUMvRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQzdDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO29CQUNyQyxFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUM7d0JBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQztvQkFDbkMsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDaEIsQ0FBQzthQUFBLENBQUMsQ0FBQztRQUNMLENBQUM7SUFDSCxDQUFDO0lBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQztBQUN0QixDQUFDO0FBZkQsZ0NBZUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBQQVJBTVNfUFJFRklYOiBzdHJpbmcgPSAnJHBhcmFtc18nO1xuY29uc3QgUk9VVEVfUFJFRklYOiBzdHJpbmcgPSAnJHJvdXRlXyc7XG5jb25zdCBNV19QUkVGSVg6IHN0cmluZyA9ICckbXcnO1xuY29uc3QgQUNUSU9OX1RZUEVTID0ge1xuICBIRUFEOiAnaGVhZCcsXG4gIEdFVDogJ2dldCcsXG4gIFBPU1Q6ICdwb3N0JyxcbiAgUFVUOiAncHV0JyxcbiAgREVMRVRFOiAnZGVsZXRlJyxcbiAgT1BUSU9OUzogJ29wdGlvbnMnLFxuICBBTEw6ICdhbGwnXG59O1xuXG4vKipcbiAqIENsYXNzIGRlY29yYXRvciBmb3IgY29udHJvbGxlciBkZWNsYXJhdGlvblxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoJy9wcm9maWxlJylcbiAqICAgIGV4cG9ydCBjbGFzcyBQcm9maWxlQ29udHJvbGxlciB7XG4gKiAgICAgIC4uLlxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ11cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb250cm9sbGVyKHBhdGg6IHN0cmluZyA9ICcnKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBjb25zdCBwcm90byA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgY29uc3QgcHJvdG9zID0gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKTtcbiAgICBjb25zdCBtd3MgPSB0YXJnZXRbTVdfUFJFRklYXSB8fCBbXTtcbiAgICB0YXJnZXQuJHBhdGggPSBwYXRoO1xuXG4gICAgcHJvdG8uJHJvdXRlcyA9IFtdO1xuICAgIGZvcihjb25zdCBwcm9wIG9mIHByb3Rvcykge1xuICAgICAgaWYocHJvcC5pbmRleE9mKFJPVVRFX1BSRUZJWCkgPT09IDApIHtcbiAgICAgICAgY29uc3QgZm5OYW1lID0gcHJvcC5zdWJzdHJpbmcoUk9VVEVfUFJFRklYLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHJvdXRlID0gcHJvdG9bcHJvcF07XG4gICAgICAgIGNvbnN0IGZuTXdzID0gcHJvdG9bYCR7TVdfUFJFRklYfV8ke2ZuTmFtZX1gXSB8fCBbXTtcblxuICAgICAgICBwcm90by4kcm91dGVzLnB1c2goe1xuICAgICAgICAgIG1ldGhvZDogcm91dGUubWV0aG9kLFxuICAgICAgICAgIHVybDogcGF0aCArIHJvdXRlLnBhdGgsXG4gICAgICAgICAgbWlkZGxld2FyZTogWy4uLm13cywgLi4uZm5Nd3NdLFxuICAgICAgICAgIGZuTmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90by4kcGFyYW1zID0ge307XG4gICAgZm9yKGNvbnN0IHByb3Agb2YgcHJvdG9zKSB7XG4gICAgICBpZihwcm9wLmluZGV4T2YoUEFSQU1TX1BSRUZJWCkgPT09IDApIHtcbiAgICAgICAgY29uc3QgeyBpbmRleCwgbmFtZSwgZm4gfSA9IHByb3RvW3Byb3BdO1xuICAgICAgICBpZighcHJvdG8uJHBhcmFtc1tuYW1lXSkgcHJvdG8uJHBhcmFtc1tuYW1lXSA9IFtdO1xuICAgICAgICBwcm90by4kcGFyYW1zW25hbWVdW2luZGV4XSA9IGZuO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG5cbi8qKlxuICogTWlkZGxld2FyZShzKSBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIEBVc2UobXlNaWRkbGV3YXJlKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKlxuICogICAgICBAR2V0KClcbiAqICAgICAgQFVzZShteU1pZGRsZXdhcmUyKVxuICogICAgICBnZXQoKSB7IC4uLiB9XG4gKlxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7Li4uQXJyYXk8KCkgPT4gdm9pZD59IG1pZGRsZXdhcmVzXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gVXNlKC4uLm1pZGRsZXdhcmVzOiBBcnJheTwoKSA9PiB2b2lkPikge1xuICByZXR1cm4gKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSA9PiB7XG4gICAgaWYoIXByb3BlcnR5S2V5KSB7XG4gICAgICBwcm9wZXJ0eUtleSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wZXJ0eUtleSA9ICdfJyArIHByb3BlcnR5S2V5O1xuICAgIH1cblxuICAgIHRhcmdldFtgJHtNV19QUkVGSVh9JHtwcm9wZXJ0eUtleX1gXSA9IG1pZGRsZXdhcmVzO1xuICB9O1xufVxuXG4vKipcbiAqIFJvdXRlIG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUm91dGUoJ2dldCcpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge3N0cmluZ30gW3BhdGg9JyddXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUm91dGUobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyA9ICcnKSB7XG4gIHJldHVybiAodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pID0+IHtcbiAgICB0YXJnZXRbYCR7Uk9VVEVfUFJFRklYfSR7cHJvcGVydHlLZXl9YF0gPSB7IG1ldGhvZCwgcGF0aCB9O1xuICB9O1xufTtcblxuLyoqXG4gKiBHZXQgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBHZXQoKVxuICogICAgICBnZXQoKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gR2V0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5HRVQsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBQb3N0IG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gUG9zdChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUE9TVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIFB1dCBtZXRob2QgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFB1dCgpXG4gKiAgICAgIHB1dCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQdXQocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLlBVVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIERlbGV0ZSBtZXRob2QgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQERlbGV0ZSgpXG4gKiAgICAgIGRlbGV0ZSgpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBEZWxldGUocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLkRFTEVURSwgcGF0aCk7XG59O1xuXG4vKipcbiAqIEluamVjdCB1dGlsaXR5IG1ldGhvZFxuICpcbiAqIEBwYXJhbSB7YW55fSBmblxuICogQHJldHVybnNcbiAqL1xuZnVuY3Rpb24gSW5qZWN0KGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuICAgIHRhcmdldFtgJHtQQVJBTVNfUFJFRklYfSR7aW5kZXh9XyR7cHJvcGVydHlLZXl9YF0gPSB7XG4gICAgICBpbmRleCxcbiAgICAgIG5hbWU6IHByb3BlcnR5S2V5LFxuICAgICAgZm5cbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIEtPQSBjb250ZXh0IGNvbnN0cnVjdG9yIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAQ3R4KCkgY3R4KSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEN0eCgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgpO1xufVxuXG4vKipcbiAqIE5vZGUgcmVxdWVzdCBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBSZXEoKSByZXEpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUmVxKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXEpO1xufVxuXG4vKipcbiAqIEtPQSByZXF1ZXN0IG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxdWVzdGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBSZXF1ZXN0KCkgcmVxdWVzdCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXF1ZXN0KCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0KTtcbn1cblxuLyoqXG4gKiBOb2RlIHJlc3BvbnNlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVzYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlcygpIHJlcykgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXMoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcyk7XG59XG5cbi8qKlxuICogS09BIHJlc3BvbnNlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVzcG9uc2VgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUmVzcG9uc2UoKSByZXNwb25zZSkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXNwb25zZSgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVzcG9uc2UpO1xufVxuXG4vKipcbiAqIEJvZHkgY29uc3RydWN0b3IgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBCb2R5KCkgbXlCb2R5KSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJvZHkoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QuYm9keSk7XG59XG5cbi8qKlxuICogRmllbGRzIGNvbnN0cnVjdG9yIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChARmllbGRzKCkgbXlGaWVsZHMpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gRmllbGRzKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0LmZpZWxkcyk7XG59XG5cbi8qKlxuICogRmlsZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc1swXWAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWxlKCkgbXlGaWxlKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpbGUoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKGN0eC5yZXF1ZXN0LmZpbGVzLmxlbmd0aCkgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpbGVzWzBdO1xuICAgIHJldHVybiBjdHgucmVxdWVzdC5maWxlcztcbiAgfSk7XG59XG5cbi8qKlxuICogRmlsZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc2AuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWxlcygpIGZpbGVzKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpbGVzKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0LmZpbGVzKTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbSBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucXVlcnlbJ2lkJ11gLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbSgnaWQnKSBpZCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVyeVBhcmFtKHByb3A/KSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKCFwcm9wKSByZXR1cm4gY3R4LnF1ZXJ5O1xuICAgIHJldHVybiBjdHgucXVlcnlbcHJvcF07XG4gIH0pO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucXVlcnlgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbXMoKSBhbGxQYXJhbXMpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbXMoKSB7XG4gIHJldHVybiBRdWVyeVBhcmFtKCk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW0gY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnBhcmFtc1tteXZhcl1gLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KCc6aWQnKVxuICogICAgICBwb3N0KEBQYXJhbSgnaWQnKSBpZCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQYXJhbShwcm9wPykge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZighcHJvcCkgcmV0dXJuIGN0eC5wYXJhbXM7XG4gICAgcmV0dXJuIGN0eC5wYXJhbXNbcHJvcF07XG4gIH0pO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucGFyYW1zYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgnOmlkLzpuYW1lJylcbiAqICAgICAgcG9zdChAUGFyYW1zKCkgb2JqKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtcygpIHtcbiAgcmV0dXJuIFBhcmFtKCk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIHBhcmFtcywgZXhlY3V0ZSBlYWNoIHdpdGggdGhlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHBhcmFtc1xuICogQHBhcmFtIGN0eFxuICogQHBhcmFtIG5leHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZ3VtZW50cyhwYXJhbXMsIGN0eCwgbmV4dCk6IGFueVtdIHtcbiAgbGV0IGFyZ3MgPSBbY3R4LCBuZXh0XTtcblxuICBpZihwYXJhbXMpIHtcbiAgICBhcmdzID0gW107XG4gICAgZm9yKGNvbnN0IGZuIG9mIHBhcmFtcykge1xuICAgICAgbGV0IHJlc3VsdDtcbiAgICAgIGlmKGZuICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IGZuKGN0eCk7XG4gICAgICBhcmdzLnB1c2gocmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXJncztcbn1cblxuLyoqXG4gKiBCaW5kcyB0aGUgcm91dGVzIHRvIHRoZSByb3V0ZXJcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIGNvbnN0IHJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcbiAqICAgIGJpbmRSb3V0ZXMocm91dGVyLCBbUHJvZmlsZUNvbnRyb2xsZXJdKTtcbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge2FueX0gcm91dGVyUm91dGVzXG4gKiBAcGFyYW0ge2FueX0gY29udHJvbGxlcnNcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kUm91dGVzKHJvdXRlclJvdXRlcywgY29udHJvbGxlcnMpOiBhbnkge1xuICBmb3IoY29uc3QgY3RybCBvZiBjb250cm9sbGVycykge1xuICAgIGNvbnN0IHJvdXRlcyA9IGN0cmwucHJvdG90eXBlLiRyb3V0ZXM7XG4gICAgZm9yKGNvbnN0IHsgbWV0aG9kLCB1cmwsIG1pZGRsZXdhcmUsIGZuTmFtZSB9IG9mIHJvdXRlcykge1xuICAgICAgcm91dGVyUm91dGVzW21ldGhvZF0odXJsLCAuLi5taWRkbGV3YXJlLCBhc3luYyBmdW5jdGlvbihjdHgsIG5leHQpIHtcbiAgICAgICAgY29uc3QgaW5zdCA9IG5ldyBjdHJsKCk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IGN0cmwucHJvdG90eXBlLiRwYXJhbXNbZm5OYW1lXTtcbiAgICAgICAgY29uc3QgYXJncyA9IGdldEFyZ3VtZW50cyhwYXJhbXMsIGN0eCwgbmV4dCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGluc3RbZm5OYW1lXSguLi5hcmdzKTtcbiAgICAgICAgaWYocmVzdWx0KSBjdHguYm9keSA9IGF3YWl0IHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcm91dGVyUm91dGVzO1xufVxuIl19