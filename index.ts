const PARAMS_PREFIX: string = '$params_';
const ROUTE_PREFIX: string = '$route_';
const MW_PREFIX: string = '$mw';
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
export function Controller(path: string = '') {
  return function(target) {
    const proto = target.prototype;
    const protos =  Object.getOwnPropertyNames(proto);
    const mws = target[MW_PREFIX] || [];
    target.$path = path;

    proto.$routes = [];
    for(const prop of protos) {
      if(prop.indexOf(ROUTE_PREFIX) === 0) {
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
    for(const prop of protos) {
      if(prop.indexOf(PARAMS_PREFIX) === 0) {
        const { index, name, fn } = proto[prop];
        if(!proto.$params[name]) proto.$params[name] = [];
        proto.$params[name][index] = fn;
      }
    }
  };
};

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
export function Use(...middlewares: Array<() => void>) {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    if(!propertyKey) {
      propertyKey = '';
    } else {
      propertyKey = '_' + propertyKey;
    }

    target[`${MW_PREFIX}${propertyKey}`] = middlewares;
  };
}

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
export function Route(method: string, path: string = '') {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    target[`${ROUTE_PREFIX}${propertyKey}`] = { method, path };
  };
};

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
export function Get(path?: string) {
  return Route(ACTION_TYPES.GET, path);
};

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
export function Post(path?: string) {
  return Route(ACTION_TYPES.POST, path);
};

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
export function Put(path?: string) {
  return Route(ACTION_TYPES.PUT, path);
};

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
export function Delete(path?: string) {
  return Route(ACTION_TYPES.DELETE, path);
};

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
export function Body() {
  return function(target: any, propertyKey: string, index: number) {
    target[`${PARAMS_PREFIX}${propertyKey}`] = {
      index,
      name: propertyKey,
      fn: (ctx) => {
        return ctx.request.fields;
      }
    };
  };
}

/**
 * Inject utility method
 *
 * @param {any} fn
 * @returns
 */
function Inject(fn) {
  return function(target: any, propertyKey: string, index: number) {
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
export function Ctx() {
  return Inject((ctx) => ctx);
}

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
export function Req() {
  return Inject((ctx) => ctx.req);
}

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
export function Request() {
  return Inject((ctx) => ctx.request);
}

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
export function Res() {
  return Inject((ctx) => ctx.res);
}

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
export function Response() {
  return Inject((ctx) => ctx.response);
}

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
export function File() {
  return Inject((ctx) => {
    if(ctx.request.files.length) return ctx.request.files[0];
    return ctx.request.files;
  });
}

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
export function Files() {
  return Inject((ctx) => ctx.request.files);
}

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
export function QueryParam(prop?) {
  return Inject((ctx) => {
    if(!prop) return ctx.query;
    return ctx.query[prop];
  });
}

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
export function QueryParams() {
  return QueryParam();
}

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
export function Param(prop?) {
  return Inject((ctx) => {
    if(!prop) return ctx.params;
    return ctx.params[prop];
  });
}

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
export function Params() {
  return Param();
}

/**
 * Given a list of params, execute each with the context.
 * 
 * @param params 
 * @param ctx 
 * @param next 
 */
export function getArguments(params, ctx, next): any[] {
  let args = [ctx, next];

  if(params) {
    args = [];
    for(const fn of params) {
      let result;
      if(fn !== undefined) result = fn(ctx);
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
 * @param {*} routerRoutes 
 * @param {any[]} controllers 
 * @param {(ctrl) => any} getter 
 * @returns {*} 
 */
export function bindRoutes(routerRoutes: any, controllers: any[], getter: (ctrl) => any): any {
  for(const ctrl of controllers) {
    const routes = ctrl.prototype.$routes;
    for(const { method, url, middleware, fnName } of routes) {
      routerRoutes[method](url, ...middleware, async function(ctx, next) {
        const inst = getter === undefined ? 
          new ctrl() : getter(ctrl);

        const params = ctrl.prototype.$params[fnName];
        const args = getArguments(params, ctx, next);
        const result = inst[fnName](...args);
        if(result) ctx.body = await result;
        return result;
      });
    }
  }
  return routerRoutes;
}
