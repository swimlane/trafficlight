const PARAMS_PREFIX: string = 'params_';
const ROUTE_PREFIX: string = 'route_';
const ACTION_TYPES = {
  HEAD: 'head',
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  OPTIONS: 'options',
  ALL: 'all'
};

export function Controller(path?: string, ...middlewares: Function[]) {
  return function(target) {
    const proto = target.prototype;
    const protos =  Object.getOwnPropertyNames(proto);
    target.$path = path;

    proto.$routes = [];
    for(const prop of protos) {
      if(prop.indexOf(ROUTE_PREFIX) === 0) {
        const route = proto[prop];
        proto.$routes.push({ 
          method: route.method, 
          url: path + route.path, 
          middleware: middlewares.concat(route.middleware),
          fnName: prop.substring(ROUTE_PREFIX.length)
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

export function Route(method: string, path?: string, ...middleware: Function[]) {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    target[`${ROUTE_PREFIX}${propertyKey}`] = {method, path: path || '', middleware};
  };
};

export function Get(path?: string, ...middlewares: Function[]) {
  return Route(ACTION_TYPES.GET, path, ...middlewares);
};

export function Post(path?: string, ...middlewares: Function[]) {
  return Route(ACTION_TYPES.POST, path, ...middlewares);
};

export function Put(path?: string, ...middlewares: Function[]) {
  return Route(ACTION_TYPES.PUT, path, ...middlewares);
};

export function Delete(path?: string, ...middlewares: Function[]) {
  return Route(ACTION_TYPES.DELETE, path, ...middlewares);
};

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

export function Inject(fn) {
  return function(target: any, propertyKey: string, index: number) {
    target[`${PARAMS_PREFIX}${index}_${propertyKey}`] = {
      index,
      name: propertyKey,
      fn
    };
  };
}

export function Ctx() {
  return Inject((ctx) => ctx);
}

export function Req() {
  return Inject((ctx) => ctx.req);
}

export function File() {
  return Inject((ctx) => {
    if(ctx.request.files.length) return ctx.request.files[0];
    return ctx.request.files;
  });
}

export function Files() {
  return Inject((ctx) => ctx.request.files);
}

export function QueryParam(prop?) {
  return Inject((ctx) => {
    if(!prop) return ctx.query;
    return ctx.query[prop];
  });
}

export function QueryParams() {
  return QueryParam();
}

export function Param(prop?) {
  return Inject((ctx) => {
    if(!prop) return ctx.params;
    return ctx.params[prop];
  });
}

export function Params() {
  return Param();
}

function getArguments(ctrl, fnName, ctx, next) {
  let args = [ctx, next];
  const params = ctrl.prototype.$params[fnName];

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

export function bindRoutes(routerRoutes, controllers) {
  for(const ctrl of controllers) {
    const routes = ctrl.prototype.$routes;
    for(const { method, url, middleware, fnName } of routes) {
      routerRoutes[method](url, ...middleware, async function(ctx, next) {
        const inst = new ctrl();
        const args = getArguments(ctrl, fnName, ctx, next);
        const result = inst[fnName](...args);
        if(result) ctx.body = await result;
        return result;
      });
    }
  }
  return routerRoutes;
}
