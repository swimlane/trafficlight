import { ROUTE_PREFIX } from './constants';
import { FileDownload } from './models/FileDownload';

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

    // sort by index
    params.sort((a, b) => {
      return a.index - b.index;
    });

    for(const param of params) {
      let result;
      if(param !== undefined) result = param.fn(ctx);
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
 * @param {(ctrl) => any} [getter]
 * @returns {*}
 */
export function bindRoutes(routerRoutes: any, controllers: any[], getter?: (ctrl) => any): any {
  for(const ctrl of controllers) {
    const routes = Reflect.getMetadata(ROUTE_PREFIX, ctrl);

    for(const { method, url, middleware, name, params } of routes) {
      routerRoutes[method](url, ...middleware, async function(ctx, next) {
        const inst = getter === undefined ?
          new ctrl() : getter(ctrl);

        const args = getArguments(params, ctx, next);
        const result = inst[name](...args);
        if(result) {
          const body = await result;
          if(body instanceof FileDownload) {
            const fileDownload = <FileDownload>body;
            ctx.res.setHeader('Content-type', fileDownload.mimeType);
            ctx.res.setHeader('Content-disposition', ('attachment; filename=' + fileDownload.fileName));
            ctx.attachment(fileDownload.fileName);
            ctx.body = fileDownload.file;
          } else {
            ctx.body = body;
          }
        }
        return result;
      });
    }
  }
  return routerRoutes;
}
