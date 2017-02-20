# trafficlight
NodeJS Routing Decorators for KOA

## Usage
1. Install `npm i trafficlight --S`

2. Setup KOA

```
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as body from 'koa-better-body';

import { MyController } from './controllers';
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
  bindRoutes(routerRoutes, [MyController]);
  
  app.use(routerRoutes.routes());
  app.use(routerRoutes.allowedMethods());
}
```

3. Decorate your controller
```
import { Controller, Get, Param, Body, Delete, Put, Post } from '../utils';

@Controller('/profile')
export class AssetController {

  @Get()
  getAll() {
    // return []
  }

  @Get('/:id')
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
