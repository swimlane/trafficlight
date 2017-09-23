/**
 * Given a list of params, execute each with the context.
 *
 * @param params
 * @param ctx
 * @param next
 */
export declare function getArguments(params: any, ctx: any, next: any): any[];
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
export declare function bindRoutes(routerRoutes: any, controllers: any[], getter?: (ctrl) => any): any;
