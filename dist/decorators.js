"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
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
        const mws = Reflect.getMetadata(constants_1.MW_PREFIX, target) || [];
        // get routes
        const routeDefs = Reflect.getMetadata(constants_1.ROUTE_PREFIX, proto) || [];
        const routes = [];
        for (const route of routeDefs) {
            const fnMws = Reflect.getMetadata(`${constants_1.MW_PREFIX}_${route.name}`, proto) || [];
            const params = Reflect.getMetadata(`${constants_1.PARAMS_PREFIX}_${route.name}`, proto) || [];
            routes.push({
                method: route.method,
                url: path + route.path,
                middleware: [...mws, ...fnMws],
                name: route.name,
                params
            });
        }
        Reflect.defineMetadata(constants_1.ROUTE_PREFIX, routes, target);
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
 * @param {...any[]} middlewares
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
        Reflect.defineMetadata(`${constants_1.MW_PREFIX}${propertyKey}`, middlewares, target);
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
        const meta = Reflect.getMetadata(constants_1.ROUTE_PREFIX, target) || [];
        meta.push({ method, path, name });
        Reflect.defineMetadata(constants_1.ROUTE_PREFIX, meta, target);
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
    return Route(constants_1.ACTION_TYPES.GET, path);
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
    return Route(constants_1.ACTION_TYPES.POST, path);
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
    return Route(constants_1.ACTION_TYPES.PUT, path);
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
    return Route(constants_1.ACTION_TYPES.DELETE, path);
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
        const meta = Reflect.getMetadata(`${constants_1.PARAMS_PREFIX}_${name}`, target) || [];
        meta.push({ index, name, fn });
        Reflect.defineMetadata(`${constants_1.PARAMS_PREFIX}_${name}`, meta, target);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQW1GO0FBRW5GOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxvQkFBMkIsT0FBZSxFQUFFO0lBQzFDLE1BQU0sQ0FBQyxVQUFTLE1BQU07UUFDcEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUUvQixrQkFBa0I7UUFDbEIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxxQkFBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV6RCxhQUFhO1FBQ2IsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyx3QkFBWSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNqRSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFFbEIsR0FBRyxDQUFBLENBQUMsTUFBTSxLQUFLLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcscUJBQVMsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdFLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyx5QkFBYSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFbEYsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDVixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07Z0JBQ3BCLEdBQUcsRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUk7Z0JBQ3RCLFVBQVUsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUM5QixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JB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QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJPVVRFX1BSRUZJWCwgTVdfUFJFRklYLCBQQVJBTVNfUFJFRklYLCBBQ1RJT05fVFlQRVMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogQ2xhc3MgZGVjb3JhdG9yIGZvciBjb250cm9sbGVyIGRlY2xhcmF0aW9uXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcignL3Byb2ZpbGUnKVxuICogICAgZXhwb3J0IGNsYXNzIFByb2ZpbGVDb250cm9sbGVyIHtcbiAqICAgICAgLi4uXG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPScnXVxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIENvbnRyb2xsZXIocGF0aDogc3RyaW5nID0gJycpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGNvbnN0IHByb3RvID0gdGFyZ2V0LnByb3RvdHlwZTtcblxuICAgIC8vIGdldCBtaWRkbGV3YXJlc1xuICAgIGNvbnN0IG13cyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoTVdfUFJFRklYLCB0YXJnZXQpIHx8IFtdO1xuXG4gICAgLy8gZ2V0IHJvdXRlc1xuICAgIGNvbnN0IHJvdXRlRGVmcyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoUk9VVEVfUFJFRklYLCBwcm90bykgfHwgW107XG4gICAgY29uc3Qgcm91dGVzID0gW107XG5cbiAgICBmb3IoY29uc3Qgcm91dGUgb2Ygcm91dGVEZWZzKSB7XG4gICAgICBjb25zdCBmbk13cyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoYCR7TVdfUFJFRklYfV8ke3JvdXRlLm5hbWV9YCwgcHJvdG8pIHx8IFtdO1xuICAgICAgY29uc3QgcGFyYW1zID0gUmVmbGVjdC5nZXRNZXRhZGF0YShgJHtQQVJBTVNfUFJFRklYfV8ke3JvdXRlLm5hbWV9YCwgcHJvdG8pIHx8IFtdO1xuXG4gICAgICByb3V0ZXMucHVzaCh7XG4gICAgICAgIG1ldGhvZDogcm91dGUubWV0aG9kLFxuICAgICAgICB1cmw6IHBhdGggKyByb3V0ZS5wYXRoLFxuICAgICAgICBtaWRkbGV3YXJlOiBbLi4ubXdzLCAuLi5mbk13c10sXG4gICAgICAgIG5hbWU6IHJvdXRlLm5hbWUsXG4gICAgICAgIHBhcmFtc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShST1VURV9QUkVGSVgsIHJvdXRlcywgdGFyZ2V0KTtcbiAgfTtcbn07XG5cbi8qKlxuICogTWlkZGxld2FyZShzKSBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIEBVc2UobXlNaWRkbGV3YXJlKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKlxuICogICAgICBAR2V0KClcbiAqICAgICAgQFVzZShteU1pZGRsZXdhcmUyKVxuICogICAgICBnZXQoKSB7IC4uLiB9XG4gKlxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7Li4uYW55W119IG1pZGRsZXdhcmVzXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gVXNlKC4uLm1pZGRsZXdhcmVzOiBhbnlbXSkge1xuICByZXR1cm4gKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSA9PiB7XG4gICAgaWYoIXByb3BlcnR5S2V5KSB7XG4gICAgICBwcm9wZXJ0eUtleSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wZXJ0eUtleSA9ICdfJyArIHByb3BlcnR5S2V5O1xuICAgIH1cblxuICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoYCR7TVdfUFJFRklYfSR7cHJvcGVydHlLZXl9YCwgbWlkZGxld2FyZXMsIHRhcmdldCk7XG4gIH07XG59XG5cbi8qKlxuICogUm91dGUgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBSb3V0ZSgnZ2V0JylcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ11cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBSb3V0ZShtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nID0gJycpIHtcbiAgcmV0dXJuICh0YXJnZXQ6IGFueSwgbmFtZTogc3RyaW5nLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSA9PiB7XG4gICAgY29uc3QgbWV0YSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoUk9VVEVfUFJFRklYLCB0YXJnZXQpIHx8IFtdO1xuICAgIG1ldGEucHVzaCh7IG1ldGhvZCwgcGF0aCwgbmFtZSB9KTtcbiAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFJPVVRFX1BSRUZJWCwgbWV0YSwgdGFyZ2V0KTtcbiAgfTtcbn07XG5cbi8qKlxuICogR2V0IG1ldGhvZCBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAR2V0KClcbiAqICAgICAgZ2V0KCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEdldChwYXRoPzogc3RyaW5nKSB7XG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuR0VULCBwYXRoKTtcbn07XG5cbi8qKlxuICogUG9zdCBtZXRob2QgZGVjb3JhdG9yXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFBvc3QocGF0aD86IHN0cmluZykge1xuICByZXR1cm4gUm91dGUoQUNUSU9OX1RZUEVTLlBPU1QsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBQdXQgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQdXQoKVxuICogICAgICBwdXQoKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gUHV0KHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5QVVQsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBEZWxldGUgbWV0aG9kIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBEZWxldGUoKVxuICogICAgICBkZWxldGUoKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gRGVsZXRlKHBhdGg/OiBzdHJpbmcpIHtcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5ERUxFVEUsIHBhdGgpO1xufTtcblxuLyoqXG4gKiBJbmplY3QgdXRpbGl0eSBtZXRob2RcbiAqXG4gKiBAZXhwb3J0XG4gKiBAcGFyYW0ge2FueX0gZm5cbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBJbmplY3QoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldDogYW55LCBuYW1lOiBzdHJpbmcsIGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCBtZXRhID0gUmVmbGVjdC5nZXRNZXRhZGF0YShgJHtQQVJBTVNfUFJFRklYfV8ke25hbWV9YCwgdGFyZ2V0KSB8fCBbXTtcbiAgICBtZXRhLnB1c2goeyBpbmRleCwgbmFtZSwgZm4gfSk7XG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShgJHtQQVJBTVNfUFJFRklYfV8ke25hbWV9YCwgbWV0YSwgdGFyZ2V0KTtcbiAgfTtcbn1cblxuLyoqXG4gKiBLT0EgY29udGV4dCBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEN0eCgpIGN0eCkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBDdHgoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4KTtcbn1cblxuLyoqXG4gKiBOb2RlIHJlcXVlc3Qgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXFgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUmVxKCkgcmVxKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFJlcSgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxKTtcbn1cblxuLyoqXG4gKiBLT0EgcmVxdWVzdCBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcXVlc3RgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAUmVxdWVzdCgpIHJlcXVlc3QpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUmVxdWVzdCgpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxdWVzdCk7XG59XG5cbi8qKlxuICogTm9kZSByZXNwb25zZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlc2AuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoKVxuICogICAgICBwb3N0KEBSZXMoKSByZXMpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUmVzKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXMpO1xufVxuXG4vKipcbiAqIEtPQSByZXNwb25zZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlc3BvbnNlYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFJlc3BvbnNlKCkgcmVzcG9uc2UpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2UoKSB7XG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlc3BvbnNlKTtcbn1cblxuLyoqXG4gKiBCb2R5IGNvbnN0cnVjdG9yIGRlY29yYXRvclxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChAQm9keSgpIG15Qm9keSkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBCb2R5KCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0LmJvZHkpO1xufVxuXG4vKipcbiAqIEZpZWxkcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQEZpZWxkcygpIG15RmllbGRzKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkcygpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxdWVzdC5maWVsZHMpO1xufVxuXG4vKipcbiAqIEZpbGUgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXEuZmlsZXNbMF1gLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChARmlsZSgpIG15RmlsZSkgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWxlKCkge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZihjdHgucmVxdWVzdC5maWxlcy5sZW5ndGgpIHJldHVybiBjdHgucmVxdWVzdC5maWxlc1swXTtcbiAgICByZXR1cm4gY3R4LnJlcXVlc3QuZmlsZXM7XG4gIH0pO1xufVxuXG4vKipcbiAqIEZpbGUgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXEuZmlsZXNgLlxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgQENvbnRyb2xsZXIoKVxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XG4gKiAgICAgIEBQb3N0KClcbiAqICAgICAgcG9zdChARmlsZXMoKSBmaWxlcykgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBGaWxlcygpIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxdWVzdC5maWxlcyk7XG59XG5cbi8qKlxuICogUXVlcnkgcGFyYW0gY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnF1ZXJ5WydpZCddYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFF1ZXJ5UGFyYW0oJ2lkJykgaWQpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbShwcm9wPykge1xuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IHtcbiAgICBpZighcHJvcCkgcmV0dXJuIGN0eC5xdWVyeTtcbiAgICByZXR1cm4gY3R4LnF1ZXJ5W3Byb3BdO1xuICB9KTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbXMgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnF1ZXJ5YC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgpXG4gKiAgICAgIHBvc3QoQFF1ZXJ5UGFyYW1zKCkgYWxsUGFyYW1zKSB7IC4uLiB9XG4gKiAgICB9XG4gKlxuICogQGV4cG9ydFxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFF1ZXJ5UGFyYW1zKCkge1xuICByZXR1cm4gUXVlcnlQYXJhbSgpO1xufVxuXG4vKipcbiAqIFF1ZXJ5IHBhcmFtIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5wYXJhbXNbbXl2YXJdYC5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgIEBDb250cm9sbGVyKClcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xuICogICAgICBAUG9zdCgnOmlkJylcbiAqICAgICAgcG9zdChAUGFyYW0oJ2lkJykgaWQpIHsgLi4uIH1cbiAqICAgIH1cbiAqXG4gKiBAZXhwb3J0XG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gUGFyYW0ocHJvcD8pIHtcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XG4gICAgaWYoIXByb3ApIHJldHVybiBjdHgucGFyYW1zO1xuICAgIHJldHVybiBjdHgucGFyYW1zW3Byb3BdO1xuICB9KTtcbn1cblxuLyoqXG4gKiBRdWVyeSBwYXJhbXMgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnBhcmFtc2AuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBAQ29udHJvbGxlcigpXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcbiAqICAgICAgQFBvc3QoJzppZC86bmFtZScpXG4gKiAgICAgIHBvc3QoQFBhcmFtcygpIG9iaikgeyAuLi4gfVxuICogICAgfVxuICpcbiAqIEBleHBvcnRcbiAqIEByZXR1cm5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBQYXJhbXMoKSB7XG4gIHJldHVybiBQYXJhbSgpO1xufVxuIl19