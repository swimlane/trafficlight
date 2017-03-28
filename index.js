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
        const mws = target[MW_PREFIX];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxhQUFhLEdBQVcsVUFBVSxDQUFDO0FBQ3pDLE1BQU0sWUFBWSxHQUFXLFNBQVMsQ0FBQztBQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUM7QUFDaEMsTUFBTSxZQUFZLEdBQUc7SUFDbkIsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixHQUFHLEVBQUUsS0FBSztDQUNYLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsb0JBQTJCLE9BQWUsRUFBRTtJQUMxQyxNQUFNLENBQUMsVUFBUyxNQUFNO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDL0IsTUFBTSxNQUFNLEdBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM5QixNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUVwQixLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixHQUFHLENBQUEsQ0FBQyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FB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LE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLEVBQUUsQ0FBQSxDQUFDLE1BQU0sQ0FBQzt3QkFBQyxHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDO29CQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNoQixDQUFDO2FBQUEsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUFkRCxnQ0FjQyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFBBUkFNU19QUkVGSVg6IHN0cmluZyA9ICckcGFyYW1zXyc7XG5jb25zdCBST1VURV9QUkVGSVg6IHN0cmluZyA9ICckcm91dGVfJztcbmNvbnN0IE1XX1BSRUZJWDogc3RyaW5nID0gJyRtdyc7XG5jb25zdCBBQ1RJT05fVFlQRVMgPSB7XG4gIEhFQUQ6ICdoZWFkJyxcbiAgR0VUOiAnZ2V0JyxcbiAgUE9TVDogJ3Bvc3QnLFxuICBQVVQ6ICdwdXQnLFxuICBERUxFVEU6ICdkZWxldGUnLFxuICBPUFRJT05TOiAnb3B0aW9ucycsXG4gIEFMTDogJ2FsbCdcbn07XG5cbi8qKlxuICogQ2xhc3MgZGVjb3JhdG9yIGZvciBjb250cm9sbGVyIGRlY2xhcmF0aW9uXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKCcvcHJvZmlsZScpXG4gKiAgICBleHBvcnQgY2xhc3MgUHJvZmlsZUNvbnRyb2xsZXIge1xuICogICAgICAuLi5cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPScnXSBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gQ29udHJvbGxlcihwYXRoOiBzdHJpbmcgPSAnJykge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgY29uc3QgcHJvdG8gPSB0YXJnZXQucHJvdG90eXBlO1xuICAgIGNvbnN0IHByb3RvcyA9ICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byk7XG4gICAgY29uc3QgbXdzID0gdGFyZ2V0W01XX1BSRUZJWF07XG4gICAgdGFyZ2V0LiRwYXRoID0gcGF0aDtcblxuICAgIHByb3RvLiRyb3V0ZXMgPSBbXTtcbiAgICBmb3IoY29uc3QgcHJvcCBvZiBwcm90b3MpIHtcbiAgICAgIGlmKHByb3AuaW5kZXhPZihST1VURV9QUkVGSVgpID09PSAwKSB7XG4gICAgICAgIGNvbnN0IGZuTmFtZSA9IHByb3Auc3Vic3RyaW5nKFJPVVRFX1BSRUZJWC5sZW5ndGgpO1xuICAgICAgICBjb25zdCByb3V0ZSA9IHByb3RvW3Byb3BdO1xuICAgICAgICBjb25zdCBmbk13cyA9IHByb3RvW2Ake01XX1BSRUZJWH1fJHtmbk5hbWV9YF0gfHwgW107XG5cbiAgICAgICAgcHJvdG8uJHJvdXRlcy5wdXNoKHtcbiAgICAgICAgICBtZXRob2Q6IHJvdXRlLm1ldGhvZCxcbiAgICAgICAgICB1cmw6IHBhdGggKyByb3V0ZS5wYXRoLFxuICAgICAgICAgIG1pZGRsZXdhcmU6IFsuLi5td3MsIC4uLmZuTXdzXSxcbiAgICAgICAgICBmbk5hbWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcHJvdG8uJHBhcmFtcyA9IHt9O1xuICAgIGZvcihjb25zdCBwcm9wIG9mIHByb3Rvcykge1xuICAgICAgaWYocHJvcC5pbmRleE9mKFBBUkFNU19QUkVGSVgpID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHsgaW5kZXgsIG5hbWUsIGZuIH0gPSBwcm90b1twcm9wXTtcbiAgICAgICAgaWYoIXByb3RvLiRwYXJhbXNbbmFtZV0pIHByb3RvLiRwYXJhbXNbbmFtZV0gPSBbXTtcbiAgICAgICAgcHJvdG8uJHBhcmFtc1tuYW1lXVtpbmRleF0gPSBmbjtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuXG4vKipcbiAqIE1pZGRsZXdhcmUocykgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIEBVc2UobXlNaWRkbGV3YXJlKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiBcbiAqICAgICAgQEdldCgpXG4gKiAgICAgIEBVc2UobXlNaWRkbGV3YXJlMilcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICogXG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7Li4uQXJyYXk8KCkgPT4gdm9pZD59IG1pZGRsZXdhcmVzIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBVc2UoLi4ubWlkZGxld2FyZXM6IEFycmF5PCgpID0+IHZvaWQ+KSB7XG4gIHJldHVybiAodGFyZ2V0OiBhbnksIHByb3BlcnR5S2V5OiBzdHJpbmcsIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pID0+IHtcbiAgICBpZighcHJvcGVydHlLZXkpIHtcbiAgICAgIHByb3BlcnR5S2V5ID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3BlcnR5S2V5ID0gJ18nICsgcHJvcGVydHlLZXk7XG4gICAgfVxuXG4gICAgdGFyZ2V0W2Ake01XX1BSRUZJWH0ke3Byb3BlcnR5S2V5fWBdID0gbWlkZGxld2FyZXM7XG4gIH07XG59XG5cbi8qKlxuICogUm91dGUgbWV0aG9kIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFJvdXRlKCdnZXQnKVxuICogICAgICBnZXQoKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgXG4gKiBAcGFyYW0ge3N0cmluZ30gW3BhdGg9JyddIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSb3V0ZShtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nID0gJycpIHtcbiAgcmV0dXJuICh0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PikgPT4ge1xuICAgIHRhcmdldFtgJHtST1VURV9QUkVGSVh9JHtwcm9wZXJ0eUtleX1gXSA9IHsgbWV0aG9kLCBwYXRoOiBwYXRoIH07XG4gIH07XG59O1xuXG4vKipcbiAqIEdldCBtZXRob2QgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAR2V0KClcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBHZXQocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLkdFVCwgcGF0aCk7XG59O1xuXG4vKipcbiAqIFBvc3QgbWV0aG9kIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQb3N0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5QT1NULCBwYXRoKTtcbn07XG5cbi8qKlxuICogUHV0IG1ldGhvZCBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQdXQoKVxuICogICAgICBwdXQoKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFB1dChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUFVULCBwYXRoKTtcbn07XG5cbi8qKlxuICogRGVsZXRlIG1ldGhvZCBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBEZWxldGUoKVxuICogICAgICBkZWxldGUoKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZShwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuREVMRVRFLCBwYXRoKTtcbn07XG5cbi8qKlxuICogQm9keSBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAQm9keSgpIG15Qm9keSkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEJvZHkoKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuICAgIHRhcmdldFtgJHtQQVJBTVNfUFJFRklYfSR7cHJvcGVydHlLZXl9YF0gPSB7XG4gICAgICBpbmRleCxcbiAgICAgIG5hbWU6IHByb3BlcnR5S2V5LFxuICAgICAgZm46IChjdHgpID0+IHtcbiAgICAgICAgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpZWxkcztcbiAgICAgIH1cbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIEluamVjdCB1dGlsaXR5IG1ldGhvZFxuICogXG4gKiBAcGFyYW0ge2FueX0gZm4gXG4gKiBAcmV0dXJucyBcbiAqL1xuZnVuY3Rpb24gSW5qZWN0KGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuICAgIHRhcmdldFtgJHtQQVJBTVNfUFJFRklYfSR7aW5kZXh9XyR7cHJvcGVydHlLZXl9YF0gPSB7XG4gICAgICBpbmRleCxcbiAgICAgIG5hbWU6IHByb3BlcnR5S2V5LFxuICAgICAgZm5cbiAgICB9O1xuICB9O1xufVxuXG4vKipcbiAqIEtPQSBjb250ZXh0IGNvbnN0cnVjdG9yIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBDdHgoKSBjdHgpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDdHgoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4KTtcbn1cblxuLyoqXG4gKiBLT0EgcmVxdWVzdCBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXFgLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBSZXF1ZXN0KCkgcmVxKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUmVxKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXEpO1xufVxuXG4vKipcbiAqIEZpbGUgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxLmZpbGVzWzBdYC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChARmlsZSgpIG15RmlsZSkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpbGUoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKGN0eC5yZXF1ZXN0LmZpbGVzLmxlbmd0aCkgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpbGVzWzBdO1xuICAgIHJldHVybiBjdHgucmVxdWVzdC5maWxlcztcbiAgfSk7XG59XG5cbi8qKlxuICogRmlsZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXEuZmlsZXNgLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWxlcygpIGZpbGVzKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gRmlsZXMoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QuZmlsZXMpO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucXVlcnlbJ2lkJ11gLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBRdWVyeVBhcmFtKCdpZCcpIGlkKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbShwcm9wPykge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZighcHJvcCkgcmV0dXJuIGN0eC5xdWVyeTtcbiAgICByZXR1cm4gY3R4LnF1ZXJ5W3Byb3BdO1xuICB9KTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbXMgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5xdWVyeWAuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFF1ZXJ5UGFyYW1zKCkgYWxsUGFyYW1zKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbXMoKSB7XG4gIHJldHVybiBRdWVyeVBhcmFtKCk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW0gY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5wYXJhbXNbbXl2YXJdYC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KCc6aWQnKVxuICogICAgICBwb3N0KEBQYXJhbSgnaWQnKSBpZCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtKHByb3A/KSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKCFwcm9wKSByZXR1cm4gY3R4LnBhcmFtcztcbiAgICByZXR1cm4gY3R4LnBhcmFtc1twcm9wXTtcbiAgfSk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW1zIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhIFxuICogc2hvcnRjdXQgZm9yIGV4YW1wbGU6IGBjdHgucGFyYW1zYC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KCc6aWQvOm5hbWUnKVxuICogICAgICBwb3N0KEBQYXJhbXMoKSBvYmopIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQYXJhbXMoKSB7XG4gIHJldHVybiBQYXJhbSgpO1xufVxuXG5mdW5jdGlvbiBnZXRBcmd1bWVudHMoY3RybCwgZm5OYW1lLCBjdHgsIG5leHQpIHtcbiAgbGV0IGFyZ3MgPSBbY3R4LCBuZXh0XTtcbiAgY29uc3QgcGFyYW1zID0gY3RybC5wcm90b3R5cGUuJHBhcmFtc1tmbk5hbWVdO1xuXG4gIGlmKHBhcmFtcykge1xuICAgIGFyZ3MgPSBbXTtcbiAgICBmb3IoY29uc3QgZm4gb2YgcGFyYW1zKSB7XG4gICAgICBsZXQgcmVzdWx0O1xuICAgICAgaWYoZm4gIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gZm4oY3R4KTtcbiAgICAgIGFyZ3MucHVzaChyZXN1bHQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhcmdzO1xufVxuXG4vKipcbiAqIEJpbmRzIHRoZSByb3V0ZXMgdG8gdGhlIHJvdXRlclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gKiAgICBiaW5kUm91dGVzKHJvdXRlciwgW1Byb2ZpbGVDb250cm9sbGVyXSk7XG4gKiBcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7YW55fSByb3V0ZXJSb3V0ZXMgXG4gKiBAcGFyYW0ge2FueX0gY29udHJvbGxlcnMgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRSb3V0ZXMocm91dGVyUm91dGVzLCBjb250cm9sbGVycykge1xuICBmb3IoY29uc3QgY3RybCBvZiBjb250cm9sbGVycykge1xuICAgIGNvbnN0IHJvdXRlcyA9IGN0cmwucHJvdG90eXBlLiRyb3V0ZXM7XG4gICAgZm9yKGNvbnN0IHsgbWV0aG9kLCB1cmwsIG1pZGRsZXdhcmUsIGZuTmFtZSB9IG9mIHJvdXRlcykge1xuICAgICAgcm91dGVyUm91dGVzW21ldGhvZF0odXJsLCAuLi5taWRkbGV3YXJlLCBhc3luYyBmdW5jdGlvbihjdHgsIG5leHQpIHtcbiAgICAgICAgY29uc3QgaW5zdCA9IG5ldyBjdHJsKCk7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXRBcmd1bWVudHMoY3RybCwgZm5OYW1lLCBjdHgsIG5leHQpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBpbnN0W2ZuTmFtZV0oLi4uYXJncyk7XG4gICAgICAgIGlmKHJlc3VsdCkgY3R4LmJvZHkgPSBhd2FpdCByZXN1bHQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdXRlclJvdXRlcztcbn1cbiJdfQ==