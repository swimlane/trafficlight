"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNvcmF0b3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEJBQTBCO0FBQzFCLDJDQUFtRjtBQUVuRjs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gsb0JBQTJCLE9BQWUsRUFBRTtJQUMxQyxNQUFNLENBQUMsVUFBUyxNQUFNO1FBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFFL0Isa0JBQWtCO1FBQ2xCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMscUJBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFekQsYUFBYTtRQUNiLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsd0JBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakUsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBRWxCLEdBQUcsQ0FBQSxDQUFDLE1BQU0sS0FBSyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLHFCQUFTLElBQUksS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3RSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcseUJBQWEsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBRWxGLE1BQU0sQ0FBQyxJQUFJLENBQUM7Z0JBQ1YsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO2dCQUNwQixHQUFHLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJO2dCQUN0QixVQUFVLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFDOUIsSUFBSSxFQUFFLEtBQUss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QUFDO0FBRkQsd0JBRUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ3JlZmxlY3QtbWV0YWRhdGEnO1xyXG5pbXBvcnQgeyBST1VURV9QUkVGSVgsIE1XX1BSRUZJWCwgUEFSQU1TX1BSRUZJWCwgQUNUSU9OX1RZUEVTIH0gZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuLyoqXHJcbiAqIENsYXNzIGRlY29yYXRvciBmb3IgY29udHJvbGxlciBkZWNsYXJhdGlvblxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcignL3Byb2ZpbGUnKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgUHJvZmlsZUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIC4uLlxyXG4gKiAgICB9XHJcbiAqXHJcbiAqIEBleHBvcnRcclxuICogQHBhcmFtIHtzdHJpbmd9IFtwYXRoPScnXVxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIENvbnRyb2xsZXIocGF0aDogc3RyaW5nID0gJycpIHtcclxuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XHJcbiAgICBjb25zdCBwcm90byA9IHRhcmdldC5wcm90b3R5cGU7XHJcblxyXG4gICAgLy8gZ2V0IG1pZGRsZXdhcmVzXHJcbiAgICBjb25zdCBtd3MgPSBSZWZsZWN0LmdldE1ldGFkYXRhKE1XX1BSRUZJWCwgdGFyZ2V0KSB8fCBbXTtcclxuXHJcbiAgICAvLyBnZXQgcm91dGVzXHJcbiAgICBjb25zdCByb3V0ZURlZnMgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFJPVVRFX1BSRUZJWCwgcHJvdG8pIHx8IFtdO1xyXG4gICAgY29uc3Qgcm91dGVzID0gW107XHJcblxyXG4gICAgZm9yKGNvbnN0IHJvdXRlIG9mIHJvdXRlRGVmcykge1xyXG4gICAgICBjb25zdCBmbk13cyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoYCR7TVdfUFJFRklYfV8ke3JvdXRlLm5hbWV9YCwgcHJvdG8pIHx8IFtdO1xyXG4gICAgICBjb25zdCBwYXJhbXMgPSBSZWZsZWN0LmdldE1ldGFkYXRhKGAke1BBUkFNU19QUkVGSVh9XyR7cm91dGUubmFtZX1gLCBwcm90bykgfHwgW107XHJcblxyXG4gICAgICByb3V0ZXMucHVzaCh7XHJcbiAgICAgICAgbWV0aG9kOiByb3V0ZS5tZXRob2QsXHJcbiAgICAgICAgdXJsOiBwYXRoICsgcm91dGUucGF0aCxcclxuICAgICAgICBtaWRkbGV3YXJlOiBbLi4ubXdzLCAuLi5mbk13c10sXHJcbiAgICAgICAgbmFtZTogcm91dGUubmFtZSxcclxuICAgICAgICBwYXJhbXNcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShST1VURV9QUkVGSVgsIHJvdXRlcywgdGFyZ2V0KTtcclxuICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIE1pZGRsZXdhcmUocykgZGVjb3JhdG9yXHJcbiAqXHJcbiAqIEV4YW1wbGU6XHJcbiAqXHJcbiAqICAgIEBDb250cm9sbGVyKClcclxuICogICAgQFVzZShteU1pZGRsZXdhcmUpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKlxyXG4gKiAgICAgIEBHZXQoKVxyXG4gKiAgICAgIEBVc2UobXlNaWRkbGV3YXJlMilcclxuICogICAgICBnZXQoKSB7IC4uLiB9XHJcbiAqXHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcGFyYW0gey4uLmFueVtdfSBtaWRkbGV3YXJlc1xyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFVzZSguLi5taWRkbGV3YXJlczogYW55W10pIHtcclxuICByZXR1cm4gKHRhcmdldDogYW55LCBwcm9wZXJ0eUtleTogc3RyaW5nLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSA9PiB7XHJcbiAgICBpZighcHJvcGVydHlLZXkpIHtcclxuICAgICAgcHJvcGVydHlLZXkgPSAnJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHByb3BlcnR5S2V5ID0gJ18nICsgcHJvcGVydHlLZXk7XHJcbiAgICB9XHJcblxyXG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShgJHtNV19QUkVGSVh9JHtwcm9wZXJ0eUtleX1gLCBtaWRkbGV3YXJlcywgdGFyZ2V0KTtcclxuICB9O1xyXG59XHJcblxyXG4vKipcclxuICogUm91dGUgbWV0aG9kIGRlY29yYXRvclxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBSb3V0ZSgnZ2V0JylcclxuICogICAgICBnZXQoKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbWV0aG9kXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0aD0nJ11cclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBSb3V0ZShtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nID0gJycpIHtcclxuICByZXR1cm4gKHRhcmdldDogYW55LCBuYW1lOiBzdHJpbmcsIGRlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pID0+IHtcclxuICAgIGNvbnN0IG1ldGEgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFJPVVRFX1BSRUZJWCwgdGFyZ2V0KSB8fCBbXTtcclxuICAgIG1ldGEucHVzaCh7IG1ldGhvZCwgcGF0aCwgbmFtZSB9KTtcclxuICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoUk9VVEVfUFJFRklYLCBtZXRhLCB0YXJnZXQpO1xyXG4gIH07XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IG1ldGhvZCBkZWNvcmF0b3JcclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAR2V0KClcclxuICogICAgICBnZXQoKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBHZXQocGF0aD86IHN0cmluZykge1xyXG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuR0VULCBwYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQb3N0IG1ldGhvZCBkZWNvcmF0b3JcclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAUG9zdCgpXHJcbiAqICAgICAgcG9zdCgpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFBvc3QocGF0aD86IHN0cmluZykge1xyXG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUE9TVCwgcGF0aCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHV0IG1ldGhvZCBkZWNvcmF0b3JcclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAUHV0KClcclxuICogICAgICBwdXQoKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBQdXQocGF0aD86IHN0cmluZykge1xyXG4gIHJldHVybiBSb3V0ZShBQ1RJT05fVFlQRVMuUFVULCBwYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEZWxldGUgbWV0aG9kIGRlY29yYXRvclxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBEZWxldGUoKVxyXG4gKiAgICAgIGRlbGV0ZSgpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIERlbGV0ZShwYXRoPzogc3RyaW5nKSB7XHJcbiAgcmV0dXJuIFJvdXRlKEFDVElPTl9UWVBFUy5ERUxFVEUsIHBhdGgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEluamVjdCB1dGlsaXR5IG1ldGhvZFxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEBwYXJhbSB7YW55fSBmblxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEluamVjdChmbikge1xyXG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQ6IGFueSwgbmFtZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XHJcbiAgICBjb25zdCBtZXRhID0gUmVmbGVjdC5nZXRNZXRhZGF0YShgJHtQQVJBTVNfUFJFRklYfV8ke25hbWV9YCwgdGFyZ2V0KSB8fCBbXTtcclxuICAgIG1ldGEucHVzaCh7IGluZGV4LCBuYW1lLCBmbiB9KTtcclxuICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoYCR7UEFSQU1TX1BSRUZJWH1fJHtuYW1lfWAsIG1ldGEsIHRhcmdldCk7XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEtPQSBjb250ZXh0IGNvbnN0cnVjdG9yIGRlY29yYXRvclxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBQb3N0KClcclxuICogICAgICBwb3N0KEBDdHgoKSBjdHgpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gQ3R4KCkge1xyXG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE5vZGUgcmVxdWVzdCBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcclxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVxYC5cclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAUG9zdCgpXHJcbiAqICAgICAgcG9zdChAUmVxKCkgcmVxKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFJlcSgpIHtcclxuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXEpO1xyXG59XHJcblxyXG4vKipcclxuICogS09BIHJlcXVlc3Qgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXHJcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcXVlc3RgLlxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBQb3N0KClcclxuICogICAgICBwb3N0KEBSZXF1ZXN0KCkgcmVxdWVzdCkgeyAuLi4gfVxyXG4gKiAgICB9XHJcbiAqXHJcbiAqIEBleHBvcnRcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBSZXF1ZXN0KCkge1xyXG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QpO1xyXG59XHJcblxyXG4vKipcclxuICogTm9kZSByZXNwb25zZSBvYmplY3QgY29uc3RydWN0b3IgZGVjb3JhdG9yLiBUaGlzIGlzIGFcclxuICogc2hvcnRjdXQgZm9yIGBjdHgucmVzYC5cclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAUG9zdCgpXHJcbiAqICAgICAgcG9zdChAUmVzKCkgcmVzKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFJlcygpIHtcclxuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXMpO1xyXG59XHJcblxyXG4vKipcclxuICogS09BIHJlc3BvbnNlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxyXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXNwb25zZWAuXHJcbiAqXHJcbiAqIEV4YW1wbGU6XHJcbiAqXHJcbiAqICAgIEBDb250cm9sbGVyKClcclxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XHJcbiAqICAgICAgQFBvc3QoKVxyXG4gKiAgICAgIHBvc3QoQFJlc3BvbnNlKCkgcmVzcG9uc2UpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUmVzcG9uc2UoKSB7XHJcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVzcG9uc2UpO1xyXG59XHJcblxyXG4vKipcclxuICogQm9keSBjb25zdHJ1Y3RvciBkZWNvcmF0b3JcclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAUG9zdCgpXHJcbiAqICAgICAgcG9zdChAQm9keSgpIG15Qm9keSkgeyAuLi4gfVxyXG4gKiAgICB9XHJcbiAqXHJcbiAqIEBleHBvcnRcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBCb2R5KCkge1xyXG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4gY3R4LnJlcXVlc3QuYm9keSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaWVsZHMgY29uc3RydWN0b3IgZGVjb3JhdG9yXHJcbiAqXHJcbiAqIEV4YW1wbGU6XHJcbiAqXHJcbiAqICAgIEBDb250cm9sbGVyKClcclxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XHJcbiAqICAgICAgQFBvc3QoKVxyXG4gKiAgICAgIHBvc3QoQEZpZWxkcygpIG15RmllbGRzKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEZpZWxkcygpIHtcclxuICByZXR1cm4gSW5qZWN0KChjdHgpID0+IGN0eC5yZXF1ZXN0LmZpZWxkcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGaWxlIG9iamVjdCBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxyXG4gKiBzaG9ydGN1dCBmb3IgYGN0eC5yZXEuZmlsZXNbMF1gLlxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBQb3N0KClcclxuICogICAgICBwb3N0KEBGaWxlKCkgbXlGaWxlKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIEZpbGUoKSB7XHJcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XHJcbiAgICBpZihjdHgucmVxdWVzdC5maWxlcy5sZW5ndGgpIHJldHVybiBjdHgucmVxdWVzdC5maWxlc1swXTtcclxuICAgIHJldHVybiBjdHgucmVxdWVzdC5maWxlcztcclxuICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpbGUgb2JqZWN0IGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXHJcbiAqIHNob3J0Y3V0IGZvciBgY3R4LnJlcS5maWxlc2AuXHJcbiAqXHJcbiAqIEV4YW1wbGU6XHJcbiAqXHJcbiAqICAgIEBDb250cm9sbGVyKClcclxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XHJcbiAqICAgICAgQFBvc3QoKVxyXG4gKiAgICAgIHBvc3QoQEZpbGVzKCkgZmlsZXMpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gRmlsZXMoKSB7XHJcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiBjdHgucmVxdWVzdC5maWxlcyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBRdWVyeSBwYXJhbSBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxyXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5xdWVyeVsnaWQnXWAuXHJcbiAqXHJcbiAqIEV4YW1wbGU6XHJcbiAqXHJcbiAqICAgIEBDb250cm9sbGVyKClcclxuICogICAgZXhwb3J0IGNsYXNzIE15Q29udHJvbGxlciB7XHJcbiAqICAgICAgQFBvc3QoKVxyXG4gKiAgICAgIHBvc3QoQFF1ZXJ5UGFyYW0oJ2lkJykgaWQpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbShwcm9wPykge1xyXG4gIHJldHVybiBJbmplY3QoKGN0eCkgPT4ge1xyXG4gICAgaWYoIXByb3ApIHJldHVybiBjdHgucXVlcnk7XHJcbiAgICByZXR1cm4gY3R4LnF1ZXJ5W3Byb3BdO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogUXVlcnkgcGFyYW1zIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXHJcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnF1ZXJ5YC5cclxuICpcclxuICogRXhhbXBsZTpcclxuICpcclxuICogICAgQENvbnRyb2xsZXIoKVxyXG4gKiAgICBleHBvcnQgY2xhc3MgTXlDb250cm9sbGVyIHtcclxuICogICAgICBAUG9zdCgpXHJcbiAqICAgICAgcG9zdChAUXVlcnlQYXJhbXMoKSBhbGxQYXJhbXMpIHsgLi4uIH1cclxuICogICAgfVxyXG4gKlxyXG4gKiBAZXhwb3J0XHJcbiAqIEByZXR1cm5zXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gUXVlcnlQYXJhbXMoKSB7XHJcbiAgcmV0dXJuIFF1ZXJ5UGFyYW0oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtIGNvbnN0cnVjdG9yIGRlY29yYXRvci4gVGhpcyBpcyBhXHJcbiAqIHNob3J0Y3V0IGZvciBleGFtcGxlOiBgY3R4LnBhcmFtc1tteXZhcl1gLlxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBQb3N0KCc6aWQnKVxyXG4gKiAgICAgIHBvc3QoQFBhcmFtKCdpZCcpIGlkKSB7IC4uLiB9XHJcbiAqICAgIH1cclxuICpcclxuICogQGV4cG9ydFxyXG4gKiBAcmV0dXJuc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIFBhcmFtKHByb3A/KSB7XHJcbiAgcmV0dXJuIEluamVjdCgoY3R4KSA9PiB7XHJcbiAgICBpZighcHJvcCkgcmV0dXJuIGN0eC5wYXJhbXM7XHJcbiAgICByZXR1cm4gY3R4LnBhcmFtc1twcm9wXTtcclxuICB9KTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFF1ZXJ5IHBhcmFtcyBjb25zdHJ1Y3RvciBkZWNvcmF0b3IuIFRoaXMgaXMgYVxyXG4gKiBzaG9ydGN1dCBmb3IgZXhhbXBsZTogYGN0eC5wYXJhbXNgLlxyXG4gKlxyXG4gKiBFeGFtcGxlOlxyXG4gKlxyXG4gKiAgICBAQ29udHJvbGxlcigpXHJcbiAqICAgIGV4cG9ydCBjbGFzcyBNeUNvbnRyb2xsZXIge1xyXG4gKiAgICAgIEBQb3N0KCc6aWQvOm5hbWUnKVxyXG4gKiAgICAgIHBvc3QoQFBhcmFtcygpIG9iaikgeyAuLi4gfVxyXG4gKiAgICB9XHJcbiAqXHJcbiAqIEBleHBvcnRcclxuICogQHJldHVybnNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBQYXJhbXMoKSB7XHJcbiAgcmV0dXJuIFBhcmFtKCk7XHJcbn1cclxuIl19