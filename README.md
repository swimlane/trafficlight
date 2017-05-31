# trafficlight
A flexible NodeJS Routing Decorators for API Routing. Features include:

- Built for KOA2
- Bring-your-own router
- Bring-your-own body parser
- TypeScript and ES7 Support
- No depedencies
- DI compatible

## Usage

### Building
`npm run build`

### Install
`npm i trafficlight --S`

### Setup KOA
```ts
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as body from 'koa-better-body';

import { ProfileController } from './controllers';
import { bindRoutes } from 'trafficlight';

export function setupKoa() {
  const app = new Koa();

  app.use(body());
  buildRoutes(app);
  app.listen(3000);

  return app;
}

function buildRoutes(app) {
  const routerRoutes = new Router();

  // any router can be used, we support koa-router out of the box
  bindRoutes(routerRoutes, [ProfileController]);

  // if you are using with some sort of DI system you can pass
  // a third parameter callback to get the instance vs new ctrl.
  // bindRoutes(routerRoutes, [ProfileController], (ctrl) => injector.get(ctrl));

  app.use(routerRoutes.routes());
  app.use(routerRoutes.allowedMethods());
}
```

### Decorate the controller
```ts
import { Controller, Get, Use, Param, Body, Delete, Put, Post, QueryParam } from 'trafficlight';

@Controller('/profile')
@Use(someMiddleware)
export class ProfileController {

  @Get()
  getAll(@QueryParam('filter') filter) {
    // return []
  }

  @Get('/:id')
  @Use(someMiddleware)
  getOne(@Param('id') id) {
    // return {}
  }

  @Post()
  create(@Body() body) {
    // return {}
  }

  @Post('/:id/upload')
  upload(@Param('id') id, @File() file) {
    // return {}
  }

  @Put('/:id')
  update(@Param('id') id, @Body() body) {
    // return {}
  }

  @Delete('/:id')
  destroy(@Param('id') id) {
    // return success
  }

}
```

## API
- `bindRoutes(routerTable, controllers, getter)` - Binds the controller to the route table.
- `Controller(url?)` - Top level controller decorator. Optional root url
- `Route(method, url?)` - Abstract method decorator, accepts method type, url
- `Get(url?)` - Http GET method, accepts URL
- `Post(url?)` - Http Post method, accepts URL
- `Put(url?)` - Http Put method, accepts URL
- `Delete(url?)` - Http Delete method, accepts URL
- `Params()` - Returns all the parameters passed in the request
- `Param(val)` - Returns a specific parameter passed in the request
- `File()` - Returns a single file in the request body
- `Files()` - Returns all files in the request body
- `QueryParams()` - Returns all the query parameters passed in the request url as an object
- `QueryParam(val)` - Returns a specific query parameter passed in the request url
- `Ctx()` - Returns the KOA context object
- `Req()` - Returns the Node request object
- `Request()` - Returns the KOA request object
- `Res()` - Returns the Node response object
- `Response()` - Returns the KOA response object
- `Body()` - Returns the request body object
- `Fields()` - Returns the request fields object
- `Use()` - Middleware decorator for class and functions

## Inspiration
- [routing-controllers](https://github.com/pleerock/routing-controllers)
- [koa-decorators](https://github.com/DavidCai1993/koa-decorators)
- [koa-route-decorators](https://github.com/xmlking/koa-router-decorators)
- [route-decorators](https://github.com/buunguyen/route-decorators)

## Credits
`trafficlight` is a [Swimlane](http://swimlane.com) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.
