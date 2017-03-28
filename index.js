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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsTUFBTSxhQUFhLEdBQVcsVUFBVSxDQUFDO0FBQ3pDLE1BQU0sWUFBWSxHQUFXLFNBQVMsQ0FBQztBQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUM7QUFDaEMsTUFBTSxZQUFZLEdBQUc7SUFDbkIsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLEtBQUs7SUFDVixNQUFNLEVBQUUsUUFBUTtJQUNoQixPQUFPLEVBQUUsU0FBUztJQUNsQixHQUFHLEVBQUUsS0FBSztDQUNYLENBQUM7QUFFRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsb0JBQTJCLE9BQWUsRUFBRTtJQUMxQyxNQUFNLENBQUMsVUFBUyxNQUFNO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDL0IsTUFBTSxNQUFNLEdBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDcEMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFcEIsS0FBSyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbkIsR0FBRyxDQUFBLENBQUMsTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFCLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLFNBQVMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFcEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ2pCLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTTtvQkFDcEIsR0FBRyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSTtvQkFDdEIsVUFBVSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7b0JBQzlCLE1BQU07aUJBQ1AsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztRQUNILENBQUM7UUFFRCxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNuQixHQUFHLENBQUEsQ0FBQyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4QyxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2xELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2xDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQWhDRCxnQ0FnQ0M7QUFBQSxDQUFDO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILGFBQW9CLEdBQUcsV0FBOEI7SUFDbkQsTUFBTSxDQUFDLENBQUMsTUFBVyxFQUFFLFdBQW1CLEVBQUUsVUFBd0M7UUFDaEYsRUFBRSxDQUFBLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDbkIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sV0FBVyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUM7UUFDbEMsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFHLFNBQVMsR0FBRyxXQUFXLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUNyRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBVkQsa0JBVUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSCxlQUFzQixNQUFjLEVBQUUsT0FBZSxFQUFFO0lBQ3JELE1BQU0sQ0FBQyxDQUFDLE1BQVcsRUFBRSxXQUFtQixFQUFFLFVBQXdDO1FBQ2hGLE1BQU0sQ0FBQyxHQUFHLFlBQVksR0FBRyxXQUFXLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNuRSxDQUFDLENBQUM7QUFDSixDQUFDO0FBSkQsc0JBSUM7QUFBQSxDQUFDO0FBRUY7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxhQUFvQixJQUFhO0lBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRkQsa0JBRUM7QUFBQSxDQUFDO0FBRUY7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxjQUFxQixJQUFhO0lBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBRkQsb0JBRUM7QUFBQSxDQUFDO0FBRUY7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxhQUFvQixJQUFhO0lBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2QyxDQUFDO0FBRkQsa0JBRUM7QUFBQSxDQUFDO0FBRUY7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxnQkFBdUIsSUFBYTtJQUNsQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUZELHdCQUVDO0FBQUEsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSDtJQUNFLE1BQU0sQ0FBQyxVQUFTLE1BQVcsRUFBRSxXQUFtQixFQUFFLEtBQWE7UUFDN0QsTUFBTSxDQUFDLEdBQUcsYUFBYSxHQUFHLFdBQVcsRUFBRSxDQUFDLEdBQUc7WUFDekMsS0FBSztZQUNMLElBQUksRUFBRSxXQUFXO1lBQ2pCLEVBQUUsRUFBRSxDQUFDLEdBQUc7Z0JBQ04sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQzVCLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVZELG9CQVVDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxnQkFBZ0IsRUFBRTtJQUNoQixNQUFNLENBQUMsVUFBUyxNQUFXLEVBQUUsV0FBbUIsRUFBRSxLQUFhO1FBQzdELE1BQU0sQ0FBQyxHQUFHLGFBQWEsR0FBRyxLQUFLLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRztZQUNsRCxLQUFLO1lBQ0wsSUFBSSxFQUFFLFdBQVc7WUFDakIsRUFBRTtTQUNILENBQUM7SUFDSixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNIO0lBQ0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRkQsa0JBRUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNIO0lBQ0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUZELGtCQUVDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSDtJQUNFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHO1FBQ2hCLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztZQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBTEQsb0JBS0M7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNIO0lBQ0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFGRCxzQkFFQztBQUVEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0gsb0JBQTJCLElBQUs7SUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUc7UUFDaEIsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFMRCxnQ0FLQztBQUVEOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBQ0g7SUFDRSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDdEIsQ0FBQztBQUZELGtDQUVDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxlQUFzQixJQUFLO0lBQ3pCLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHO1FBQ2hCLEVBQUUsQ0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBTEQsc0JBS0M7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNIO0lBQ0UsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2pCLENBQUM7QUFGRCx3QkFFQztBQUVEOzs7Ozs7R0FNRztBQUNILHNCQUE2QixNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUk7SUFDNUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFdkIsRUFBRSxDQUFBLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNWLElBQUksR0FBRyxFQUFFLENBQUM7UUFDVixHQUFHLENBQUEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksTUFBTSxDQUFDO1lBQ1gsRUFBRSxDQUFBLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQztnQkFBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEIsQ0FBQztJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQWJELG9DQWFDO0FBRUQ7Ozs7Ozs7Ozs7OztHQVlHO0FBQ0gsb0JBQTJCLFlBQVksRUFBRSxXQUFXO0lBQ2xELEdBQUcsQ0FBQSxDQUFDLE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDdEMsR0FBRyxDQUFBLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDeEQsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFVBQVUsRUFBRSxVQUFlLEdBQUcsRUFBRSxJQUFJOztvQkFDL0QsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzlDLE1BQU0sSUFBSSxHQUFHLFlBQVksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztvQkFDckMsRUFBRSxDQUFBLENBQUMsTUFBTSxDQUFDO3dCQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7b0JBQ25DLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2hCLENBQUM7YUFBQSxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU0sQ0FBQyxZQUFZLENBQUM7QUFDdEIsQ0FBQztBQWZELGdDQWVDIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgUEFSQU1TX1BSRUZJWDogc3RyaW5nID0gJyRwYXJhbXNfJztcbmNvbnN0IFJPVVRFX1BSRUZJWDogc3RyaW5nID0gJyRyb3V0ZV8nO1xuY29uc3QgTVdfUFJFRklYOiBzdHJpbmcgPSAnJG13JztcbmNvbnN0IEFDVElPTl9UWVBFUyA9IHtcbiAgSEVBRDogJ2hlYWQnLFxuICBHRVQ6ICdnZXQnLFxuICBQT1NUOiAncG9zdCcsXG4gIFBVVDogJ3B1dCcsXG4gIERFTEVURTogJ2RlbGV0ZScsXG4gIE9QVElPTlM6ICdvcHRpb25zJyxcbiAgQUxMOiAnYWxsJ1xufTtcblxuLyoqXG4gKiBDbGFzcyBkZWNvcmF0b3IgZm9yIGNvbnRyb2xsZXIgZGVjbGFyYXRpb25cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoJy9wcm9maWxlJylcbiAqICAgIGV4cG9ydCBjbGFzcyBQcm9maWxlQ29udHJvbGxlciB7XG4gKiAgICAgIC4uLlxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge3N0cmluZ30gW3BhdGg9JyddIFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDb250cm9sbGVyKHBhdGg6IHN0cmluZyA9ICcnKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBjb25zdCBwcm90byA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgY29uc3QgcHJvdG9zID0gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHByb3RvKTtcbiAgICBjb25zdCBtd3MgPSB0YXJnZXRbTVdfUFJFRklYXSB8fCBbXTtcbiAgICB0YXJnZXQuJHBhdGggPSBwYXRoO1xuXG4gICAgcHJvdG8uJHJvdXRlcyA9IFtdO1xuICAgIGZvcihjb25zdCBwcm9wIG9mIHByb3Rvcykge1xuICAgICAgaWYocHJvcC5pbmRleE9mKFJPVVRFX1BSRUZJWCkgPT09IDApIHtcbiAgICAgICAgY29uc3QgZm5OYW1lID0gcHJvcC5zdWJzdHJpbmcoUk9VVEVfUFJFRklYLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHJvdXRlID0gcHJvdG9bcHJvcF07XG4gICAgICAgIGNvbnN0IGZuTXdzID0gcHJvdG9bYCR7TVdfUFJFRklYfV8ke2ZuTmFtZX1gXSB8fCBbXTtcblxuICAgICAgICBwcm90by4kcm91dGVzLnB1c2goe1xuICAgICAgICAgIG1ldGhvZDogcm91dGUubWV0aG9kLFxuICAgICAgICAgIHVybDogcGF0aCArIHJvdXRlLnBhdGgsXG4gICAgICAgICAgbWlkZGxld2FyZTogWy4uLm13cywgLi4uZm5Nd3NdLFxuICAgICAgICAgIGZuTmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90by4kcGFyYW1zID0ge307XG4gICAgZm9yKGNvbnN0IHByb3Agb2YgcHJvdG9zKSB7XG4gICAgICBpZihwcm9wLmluZGV4T2YoUEFSQU1TX1BSRUZJWCkgPT09IDApIHtcbiAgICAgICAgY29uc3QgeyBpbmRleCwgbmFtZSwgZm4gfSA9IHByb3RvW3Byb3BdO1xuICAgICAgICBpZighcHJvdG8uJHBhcmFtc1tuYW1lXSkgcHJvdG8uJHBhcmFtc1tuYW1lXSA9IFtdO1xuICAgICAgICBwcm90by4kcGFyYW1zW25hbWVdW2luZGV4XSA9IGZuO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn07XG5cbi8qKlxuICogTWlkZGxld2FyZShzKSBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgQFVzZShteU1pZGRsZXdhcmUpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqIFxuICogICAgICBAR2V0KClcbiAqICAgICAgQFVzZShteU1pZGRsZXdhcmUyKVxuICogICAgICBnZXQoKSB7IC4uLiB9XG4gKiBcbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHBhcmFtIHsuLi5BcnJheTwoKSA9PiB2b2lkPn0gbWlkZGxld2FyZXMgXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFVzZSguLi5taWRkbGV3YXJlczogQXJyYXk8KCkgPT4gdm9pZD4pIHtcbiAgcmV0dXJuICh0YXJnZXQ6IGFueSwgcHJvcGVydHlLZXk6IHN0cmluZywgZGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55PikgPT4ge1xuICAgIGlmKCFwcm9wZXJ0eUtleSkge1xuICAgICAgcHJvcGVydHlLZXkgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcGVydHlLZXkgPSAnXycgKyBwcm9wZXJ0eUtleTtcbiAgICB9XG5cbiAgICB0YXJnZXRbYCR7TVdfUFJFRklYfSR7cHJvcGVydHlLZXl9YF0gPSBtaWRkbGV3YXJlcztcbiAgfTtcbn1cblxuLyoqXG4gKiBSb3V0ZSBtZXRob2QgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUm91dGUoJ2dldCcpXG4gKiAgICAgIGdldCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHBhcmFtIHtzdHJpbmd9IG1ldGhvZCBcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ10gXG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJvdXRlKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcgPSAnJykge1xuICByZXR1cm4gKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSA9PiB7XG4gICAgdGFyZ2V0W2Ake1JPVVRFX1BSRUZJWH0ke3Byb3BlcnR5S2V5fWBdID0geyBtZXRob2QsIHBhdGg6IHBhdGggfTtcbiAgfTtcbn07XG5cbi8qKlxuICogR2V0IG1ldGhvZCBkZWNvcmF0b3JcbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBHZXQoKVxuICogICAgICBnZXQoKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuR0VULCBwYXRoKTtcbn07XG5cbi8qKlxuICogUG9zdCBtZXRob2QgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBvc3QocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLlBPU1QsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBQdXQgbWV0aG9kIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFB1dCgpXG4gKiAgICAgIHB1dCgpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUHV0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5QVVQsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgbWV0aG9kIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQERlbGV0ZSgpXG4gKiAgICAgIGRlbGV0ZSgpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICovXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlKHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5ERUxFVEUsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBCb2R5IGNvbnN0cnVjdG9yIGRlY29yYXRvclxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBCb2R5KCkgbXlCb2R5KSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gQm9keSgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgdGFyZ2V0W2Ake1BBUkFNU19QUkVGSVh9JHtwcm9wZXJ0eUtleX1gXSA9IHtcbiAgICAgIGluZGV4LFxuICAgICAgbmFtZTogcHJvcGVydHlLZXksXG4gICAgICBmbjogKGN0eCkgPT4ge1xuICAgICAgICByZXR1cm4gY3R4LnJlcXVlc3QuZmllbGRzO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogSW5qZWN0IHV0aWxpdHkgbWV0aG9kXG4gKiBcbiAqIEBwYXJhbSB7YW55fSBmbiBcbiAqIEByZXR1cm5zIFxuICovXG5mdW5jdGlvbiBJbmplY3QoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gICAgdGFyZ2V0W2Ake1BBUkFNU19QUkVGSVh9JHtpbmRleH1fJHtwcm9wZXJ0eUtleX1gXSA9IHtcbiAgICAgIGluZGV4LFxuICAgICAgbmFtZTogcHJvcGVydHlLZXksXG4gICAgICBmblxuICAgIH07XG4gIH07XG59XG5cbi8qKlxuICogS09BIGNvbnRleHQgY29uc3RydWN0b3IgZGVjb3JhdG9yXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEN0eCgpIGN0eCkgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEN0eCgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgpO1xufVxuXG4vKipcbiAqIEtPQSByZXF1ZXN0IG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcWAuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlcXVlc3QoKSByZXEpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSZXEoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcSk7XG59XG5cbi8qKlxuICogRmlsZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXEuZmlsZXNbMF1gLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBGaWxlKCkgbXlGaWxlKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gRmlsZSgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoY3R4LnJlcXVlc3QuZmlsZXMubGVuZ3RoKSByZXR1cm4gY3R4LnJlcXVlc3QuZmlsZXNbMF07XG4gICAgcmV0dXJuIGN0eC5yZXF1ZXN0LmZpbGVzO1xuICB9KTtcbn1cblxuLyoqXG4gKiBGaWxlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc2AuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEZpbGVzKCkgZmlsZXMpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWxlcygpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxdWVzdC5maWxlcyk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW0gY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5xdWVyeVsnaWQnXWAuXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFF1ZXJ5UGFyYW0oJ2lkJykgaWQpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVyeVBhcmFtKHByb3A/KSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xuICAgIGlmKCFwcm9wKSByZXR1cm4gY3R4LnF1ZXJ5O1xuICAgIHJldHVybiBjdHgucXVlcnlbcHJvcF07XG4gIH0pO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnF1ZXJ5YC5cbiAqIFxuICogRXhhbXBsZTpcbiAqIFxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbXMoKSBhbGxQYXJhbXMpIHsgLi4uIH1cbiAqICAgIH1cbiAqIFxuICogQGV4cG9ydFxuICogQHJldHVybnMgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBRdWVyeVBhcmFtcygpIHtcbiAgcmV0dXJuIFF1ZXJ5UGFyYW0oKTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbSBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYSBcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnBhcmFtc1tteXZhcl1gLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoJzppZCcpXG4gKiAgICAgIHBvc3QoQFBhcmFtKCdpZCcpIGlkKSB7IC4uLiB9XG4gKiAgICB9XG4gKiBcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gUGFyYW0ocHJvcD8pIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoIXByb3ApIHJldHVybiBjdHgucGFyYW1zO1xuICAgIHJldHVybiBjdHgucGFyYW1zW3Byb3BdO1xuICB9KTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbXMgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGEgXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5wYXJhbXNgLlxuICogXG4gKiBFeGFtcGxlOlxuICogXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoJzppZC86bmFtZScpXG4gKiAgICAgIHBvc3QoQFBhcmFtcygpIG9iaikgeyAuLi4gfVxuICogICAgfVxuICogXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJucyBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtcygpIHtcbiAgcmV0dXJuIFBhcmFtKCk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIHBhcmFtcywgZXhlY3V0ZSBlYWNoIHdpdGggdGhlIGNvbnRleHQuXG4gKiBcbiAqIEBwYXJhbSBwYXJhbXMgXG4gKiBAcGFyYW0gY3R4IFxuICogQHBhcmFtIG5leHQgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmd1bWVudHMocGFyYW1zLCBjdHgsIG5leHQpOiBhbnlbXSB7XG4gIGxldCBhcmdzID0gW2N0eCwgbmV4dF07XG5cbiAgaWYocGFyYW1zKSB7XG4gICAgYXJncyA9IFtdO1xuICAgIGZvcihjb25zdCBmbiBvZiBwYXJhbXMpIHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZihmbiAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSBmbihjdHgpO1xuICAgICAgYXJncy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogQmluZHMgdGhlIHJvdXRlcyB0byB0aGUgcm91dGVyXG4gKiBcbiAqIEV4YW1wbGU6XG4gKiBcbiAqICAgIGNvbnN0IHJvdXRlciA9IG5ldyBSb3V0ZXIoKTtcbiAqICAgIGJpbmRSb3V0ZXMocm91dGVyLCBbUHJvZmlsZUNvbnRyb2xsZXJdKTtcbiAqIFxuICogQGV4cG9ydFxuICogQHBhcmFtIHthbnl9IHJvdXRlclJvdXRlcyBcbiAqIEBwYXJhbSB7YW55fSBjb250cm9sbGVycyBcbiAqIEByZXR1cm5zIFxuICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFJvdXRlcyhyb3V0ZXJSb3V0ZXMsIGNvbnRyb2xsZXJzKTogYW55IHtcbiAgZm9yKGNvbnN0IGN0cmwgb2YgY29udHJvbGxlcnMpIHtcbiAgICBjb25zdCByb3V0ZXMgPSBjdHJsLnByb3RvdHlwZS4kcm91dGVzO1xuICAgIGZvcihjb25zdCB7IG1ldGhvZCwgdXJsLCBtaWRkbGV3YXJlLCBmbk5hbWUgfSBvZiByb3V0ZXMpIHtcbiAgICAgIHJvdXRlclJvdXRlc1ttZXRob2RdKHVybCwgLi4ubWlkZGxld2FyZSwgYXN5bmMgZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gICAgICAgIGNvbnN0IGluc3QgPSBuZXcgY3RybCgpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBjdHJsLnByb3RvdHlwZS4kcGFyYW1zW2ZuTmFtZV07XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXRBcmd1bWVudHMocGFyYW1zLCBjdHgsIG5leHQpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBpbnN0W2ZuTmFtZV0oLi4uYXJncyk7XG4gICAgICAgIGlmKHJlc3VsdCkgY3R4LmJvZHkgPSBhd2FpdCByZXN1bHQ7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdXRlclJvdXRlcztcbn1cbiJdfQ==