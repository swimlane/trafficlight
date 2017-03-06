# trafficlight
A flexible NodeJS Routing Decorators for API Routing. Features include:

- Built for KOA2
- Bring-your-own router
- Bring-your-own body parser
- TypeScript and ES7 Support
- No depedencies

## Usage
### Install 
`npm i trafficlight --S`

### Setup KOA
```
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

  // any router can be used, we support koa-router 
  // out of the box
  bindRoutes(routerRoutes, [ProfileController]);
  
  app.use(routerRoutes.routes());
  app.use(routerRoutes.allowedMethods());
}
```

### Decorate the controller
```
import { Controller, Get, Param, Body, Delete, Put, Post, QueryParam } from '../utils';

@Controller('/profile', someMiddleware)
export class ProfileController {

  @Get()
  getAll(@QueryParam('filter') filter) {
    // return []
  }

  @Get('/:id', someMiddleware)
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
- `Controller(url?, ...middleware)` - Top level controller decorator. Optional root url and middlewares can be passed.
- `Route(method, url?, ...middleware)` - Abstract method decorator, accepts method type, url and n* middlewares
- `Get(url?, ...middleware)` - Http GET method, accepts URL and n* middlewares
- `Post(url?, ...middleware)` - Http Post method, accepts URL and n* middlewares
- `Put(url?, ...middleware)` - Http Put method, accepts URL and n* middlewares
- `Delete(url?, ...middleware)` - Http Delete method, accepts URL and n* middlewares
- `Params()` - Returns all the parameters passed in the request
- `Param(val)` - Returns a specific parameter passed in the request
- `File()` - Returns a single file in the request body
- `Files()` - Returns all files in the request body
- `QueryParams()` - Returns all the query parameters passed in the request url as an object
- `QueryParam(val)` - Returns a specific query parameter passed in the request url
- `Ctx()` - Returns the KOA context object
- `Body()` - Returns the request body object


## Inspiration
- [routing-controllers](https://github.com/pleerock/routing-controllers)
- [koa-decorators](https://github.com/DavidCai1993/koa-decorators)
- [koa-route-decorators](https://github.com/xmlking/koa-router-decorators)
- [route-decorators](https://github.com/buunguyen/route-decorators)
