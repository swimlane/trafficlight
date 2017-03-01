# trafficlight
A flexible NodeJS Routing Decorators for API Routing. Features include:

- Built for KOA2
- Bring-your-own router
- Bring-your-own body parser
- TypeScript and ES7 Support
- No depedencies

## Usage

### Building
`npm run build`

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
import { Controller, Get, Param, Body, Delete, Put, Post } from '../utils';

@Controller('/profile', someMiddleware)
export class ProfileController {

  @Get()
  getAll() {
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

## Inspiration
- [routing-controllers](https://github.com/pleerock/routing-controllers)
- [koa-decorators](https://github.com/DavidCai1993/koa-decorators)
- [koa-route-decorators](https://github.com/xmlking/koa-router-decorators)
- [route-decorators](https://github.com/buunguyen/route-decorators)
