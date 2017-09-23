"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
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
        // sort by index
        params.sort((a, b) => {
            return a.index - b.index;
        });
        for (const param of params) {
            let result;
            if (param !== undefined)
                result = param.fn(ctx);
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
 * @param {*} routerRoutes
 * @param {any[]} controllers
 * @param {(ctrl) => any} [getter]
 * @returns {*}
 */
function bindRoutes(routerRoutes, controllers, getter) {
    for (const ctrl of controllers) {
        const routes = Reflect.getMetadata(constants_1.ROUTE_PREFIX, ctrl);
        for (const { method, url, middleware, name, params } of routes) {
            routerRoutes[method](url, ...middleware, async function (ctx, next) {
                const inst = getter === undefined ?
                    new ctrl() : getter(ctrl);
                const args = getArguments(params, ctx, next);
                const result = inst[name](...args);
                if (result) {
                    const body = await result;
                    const fileDownload = body;
                    if (fileDownload) {
                        ctx.res.setHeader('Content-type', fileDownload.mimeType);
                        ctx.res.setHeader('Content-Type', 'application/force-download');
                        ctx.res.setHeader('Content-disposition', ('attachment; filename=' + fileDownload.fileName));
                        ctx.body = fileDownload.stream;
                    }
                    else {
                        ctx.body = body;
                    }
                }
                return result;
            });
        }
    }
    return routerRoutes;
}
exports.bindRoutes = bindRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluZGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYmluZGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBMkM7QUFHM0M7Ozs7OztHQU1HO0FBQ0gsc0JBQTZCLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSTtJQUM1QyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUV2QixFQUFFLENBQUEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ1YsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUVWLGdCQUFnQjtRQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDO1FBRUgsR0FBRyxDQUFBLENBQUMsTUFBTSxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLE1BQU0sQ0FBQztZQUNYLEVBQUUsQ0FBQSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUM7Z0JBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDL0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQixDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBbkJELG9DQW1CQztBQUVEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxvQkFBMkIsWUFBaUIsRUFBRSxXQUFrQixFQUFFLE1BQXNCO0lBQ3RGLEdBQUcsQ0FBQSxDQUFDLE1BQU0sSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyx3QkFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZELEdBQUcsQ0FBQSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM5RCxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxFQUFFLEtBQUssV0FBVSxHQUFHLEVBQUUsSUFBSTtnQkFDL0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxLQUFLLFNBQVM7b0JBQy9CLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUU1QixNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ25DLEVBQUUsQ0FBQSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUM7b0JBQzFCLE1BQU0sWUFBWSxHQUFHLElBQW9CLENBQUM7b0JBQzFDLEVBQUUsQ0FBQSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ2hCLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3pELEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO3dCQUNoRSxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLHVCQUF1QixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO3dCQUM1RixHQUFHLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7b0JBQ2pDLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ04sR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ2xCLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFDRCxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3RCLENBQUM7QUE1QkQsZ0NBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUk9VVEVfUFJFRklYIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtGaWxlRG93bmxvYWR9IGZyb20gJy4vbW9kZWxzL0ZpbGVEb3dubG9hZCc7XG5cbi8qKlxuICogR2l2ZW4gYSBsaXN0IG9mIHBhcmFtcywgZXhlY3V0ZSBlYWNoIHdpdGggdGhlIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHBhcmFtc1xuICogQHBhcmFtIGN0eFxuICogQHBhcmFtIG5leHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFyZ3VtZW50cyhwYXJhbXMsIGN0eCwgbmV4dCk6IGFueVtdIHtcbiAgbGV0IGFyZ3MgPSBbY3R4LCBuZXh0XTtcblxuICBpZihwYXJhbXMpIHtcbiAgICBhcmdzID0gW107XG5cbiAgICAvLyBzb3J0IGJ5IGluZGV4XG4gICAgcGFyYW1zLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICB9KTtcblxuICAgIGZvcihjb25zdCBwYXJhbSBvZiBwYXJhbXMpIHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICBpZihwYXJhbSAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSBwYXJhbS5mbihjdHgpO1xuICAgICAgYXJncy5wdXNoKHJlc3VsdCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbi8qKlxuICogQmluZHMgdGhlIHJvdXRlcyB0byB0aGUgcm91dGVyXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICBjb25zdCByb3V0ZXIgPSBuZXcgUm91dGVyKCk7XG4gKiAgICBiaW5kUm91dGVzKHJvdXRlciwgW1Byb2ZpbGVDb250cm9sbGVyXSk7XG4gKlxuICogQGV4cG9ydFxuICogQHBhcmFtIHsqfSByb3V0ZXJSb3V0ZXNcbiAqIEBwYXJhbSB7YW55W119IGNvbnRyb2xsZXJzXG4gKiBAcGFyYW0geyhjdHJsKSA9PiBhbnl9IFtnZXR0ZXJdXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRSb3V0ZXMocm91dGVyUm91dGVzOiBhbnksIGNvbnRyb2xsZXJzOiBhbnlbXSwgZ2V0dGVyPzogKGN0cmwpID0+IGFueSk6IGFueSB7XG4gIGZvcihjb25zdCBjdHJsIG9mIGNvbnRyb2xsZXJzKSB7XG4gICAgY29uc3Qgcm91dGVzID0gUmVmbGVjdC5nZXRNZXRhZGF0YShST1VURV9QUkVGSVgsIGN0cmwpO1xuXG4gICAgZm9yKGNvbnN0IHsgbWV0aG9kLCB1cmwsIG1pZGRsZXdhcmUsIG5hbWUsIHBhcmFtcyB9IG9mIHJvdXRlcykge1xuICAgICAgcm91dGVyUm91dGVzW21ldGhvZF0odXJsLCAuLi5taWRkbGV3YXJlLCBhc3luYyBmdW5jdGlvbihjdHgsIG5leHQpIHtcbiAgICAgICAgY29uc3QgaW5zdCA9IGdldHRlciA9PT0gdW5kZWZpbmVkID9cbiAgICAgICAgICBuZXcgY3RybCgpIDogZ2V0dGVyKGN0cmwpO1xuXG4gICAgICAgIGNvbnN0IGFyZ3MgPSBnZXRBcmd1bWVudHMocGFyYW1zLCBjdHgsIG5leHQpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBpbnN0W25hbWVdKC4uLmFyZ3MpO1xuICAgICAgICBpZihyZXN1bHQpIHtcbiAgICAgICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVzdWx0O1xuICAgICAgICAgIGNvbnN0IGZpbGVEb3dubG9hZCA9IGJvZHkgYXMgRmlsZURvd25sb2FkO1xuICAgICAgICAgIGlmKGZpbGVEb3dubG9hZCkge1xuICAgICAgICAgICAgY3R4LnJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtdHlwZScsIGZpbGVEb3dubG9hZC5taW1lVHlwZSk7XG4gICAgICAgICAgICBjdHgucmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2ZvcmNlLWRvd25sb2FkJyk7XG4gICAgICAgICAgICBjdHgucmVzLnNldEhlYWRlcignQ29udGVudC1kaXNwb3NpdGlvbicsICgnYXR0YWNobWVudDsgZmlsZW5hbWU9JyArIGZpbGVEb3dubG9hZC5maWxlTmFtZSkpO1xuICAgICAgICAgICAgY3R4LmJvZHkgPSBmaWxlRG93bmxvYWQuc3RyZWFtO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdHguYm9keSA9IGJvZHk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJvdXRlclJvdXRlcztcbn1cbiJdfQ==