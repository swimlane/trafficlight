import { ROUTE_PREFIX } from './constants';
import { FileDownload } from './models/FileDownload';

/**
 * Given a list of params, execute each with the context
 * and returns their result.
 *
 * @param params
 * @param ctx
 * @param next
 */
export function getArguments(params, ctx): any[] {
  const args = [];

  if (params) {
    for (const param of params) {
      if (param === undefined) continue;
      args[param.index] = param.fn(ctx);
    }
  }

  return args;
}

/**
 * Given a list of async params, execute each async simultaneously with the context
 * and returns their result.
 *
 * @param params
 * @param ctx
 * @param next
 */
export async function getAsyncArguments(args, params, ctx): Promise<any[]> {
  args = Array.from(args);

  const asyncFns = [];
  for (const param of params) {
    if (param === undefined) continue;
    asyncFns.push(param.fn(ctx));
  }

  const results = await Promise.all(asyncFns);

  let resultIndex = 0;
  for (const param of params) {
    if (param === undefined) continue;
    args[param.index] = results[resultIndex++];
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
export function bindRoutes(routerRoutes, controllers: any[], getter?: (ctrl) => any): any {
  for (const ctrl of controllers) {
    const routes = Reflect.getMetadata(ROUTE_PREFIX, ctrl);

    for (const { method, url, middleware, name, params, asyncParams } of routes) {
      if (routerRoutes[method]) {
        // tslint:disable-next-line: tsr-detect-unsafe-properties-access
        routerRoutes[method](url, ...middleware, async (ctx, next) => {
          const inst = getter === undefined ? new ctrl() : getter(ctrl);

          let args = getArguments(params, ctx);
          if (asyncParams) {
            args = await getAsyncArguments(args, asyncParams, ctx);
          }

          if (!params && !asyncParams) {
            args = [ctx, next];
          }

          const result = inst[name](...args);
          if (result) {
            const body = await result;
            if (body instanceof FileDownload) {
              const fileDownload = <FileDownload>body;
              ctx.res.setHeader('Content-type', fileDownload.mimeType);
              ctx.res.setHeader('Content-disposition', 'attachment; filename=' + fileDownload.fileName);
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
  }
  return routerRoutes;
}
