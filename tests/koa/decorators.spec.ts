import 'reflect-metadata';
import * as TL from '../../src/';
import * as http from 'http';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as koaBody from 'koa-better-body';
import * as request from 'supertest';
import { expect } from 'chai';

describe('Koa - Decorators', () => {
  function setupKoa(controllers: any[]): Koa {
    const app = new Koa();
    app.use(koaBody({}));

    const router = new Router();
    TL.bindRoutes(router, controllers);
    app.use(router.routes());
    app.use(router.allowedMethods());

    return app;
  }

  describe('Controller', () => {
    it('should annotate a basic controller', async () => {
      @TL.Controller()
      class BasicController {
        @TL.Get()
        getTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([BasicController]).listen()).get('/').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should annotate a controller with a base path', async () => {
      @TL.Controller('/foo')
      class PathController {
        @TL.Get()
        getTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([PathController]).listen()).get('/foo').expect(200);
      expect(result.text).to.equal('foo');
    });
  });

  describe('Path Generation', () => {
    it('should support a path with a starting /', async () => {
      @TL.Controller('/foo')
      class GetController {
        @TL.Get('/bar')
        getTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([GetController]).listen()).get('/foo/bar').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should support a path without a starting /', async () => {
      @TL.Controller('foo')
      class GetController {
        @TL.Get('bar')
        getTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([GetController]).listen()).get('/foo/bar').expect(200);
      expect(result.text).to.equal('foo');
    });
  });

  describe('HTTP Verbs', () => {
    it('should handle a non-shortcut method', async () => {
      @TL.Controller()
      class RouteController {
        @TL.Route('get')
        getTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([RouteController]).listen()).get('/').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should handle a GET request', async () => {
      @TL.Controller()
      class GetController {
        @TL.Get()
        getTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([GetController]).listen()).get('/').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should handle a POST request', async () => {
      @TL.Controller()
      class PostController {
        @TL.Post()
        postTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([PostController]).listen()).post('/').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should handle a PUT request', async () => {
      @TL.Controller()
      class PutController {
        @TL.Put()
        putTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([PutController]).listen()).put('/').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should handle a PATCH request', async () => {
      @TL.Controller()
      class PatchController {
        @TL.Patch()
        patchTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([PatchController]).listen()).patch('/').expect(200);
      expect(result.text).to.equal('foo');
    });

    it('should handle a DELETE request', async () => {
      @TL.Controller()
      class DeleteController {
        @TL.Delete()
        deleteTest() {
          return 'foo';
        }
      }

      const result = await request(setupKoa([DeleteController]).listen()).delete('/').expect(200);
      expect(result.text).to.equal('foo');
    });
  });

  describe('Middleware', () => {
    const ucMiddleware = async (ctx, next): Promise<void> => {
      await next();
      ctx.response.body = ctx.response.body.toUpperCase();
    };

    xit('should apply middleware to an entire class', async () => {
      // @TL.Controller()
      // @TL.Use(ucMiddleware) // Typescript does not like this for some reason
      // class MiddlewareController {
      //   @TL.Get('/foo')
      //   foo() {
      //     return 'foo';
      //   }

      //   @TL.Get('/bar')
      //   bar() {
      //     return 'bar';
      //   }
      // }

      // const fooResult = await request(setupKoa([MiddlewareController]).listen()).get('/foo').expect(200);
      // expect(fooResult.text).to.equal('FOO');

      // const barResult = await request(setupKoa([MiddlewareController]).listen()).get('/bar').expect(200);
      // expect(barResult.text).to.equal('BAR');
    });

    it('should apply middleware to a single route', async () => {
      @TL.Controller()
      class MiddlewareController {
        @TL.Get('/foo')
        @TL.Use(ucMiddleware)
        foo() {
          return 'foo';
        }

        @TL.Get('/bar')
        bar() {
          return 'bar';
        }
      }

      const fooResult = await request(setupKoa([MiddlewareController]).listen()).get('/foo').expect(200);
      expect(fooResult.text).to.equal('FOO');

      const barResult = await request(setupKoa([MiddlewareController]).listen()).get('/bar').expect(200);
      expect(barResult.text).to.equal('bar');
    });
  });

  describe('Parameters', () => {
    it('should inject ctx', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.Ctx() ctx: Koa.Context) {
          return ctx;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen()).get('/foo').expect(200);
      expect(fooResult.body).to.haveOwnProperty('response');
    });

    it('should inject req', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.Req() req: http.ClientRequest) {
          return req;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen()).get('/foo').expect(200);
      expect(fooResult.body).to.instanceof(Buffer);
    });

    it('should inject Request', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.Request() myRequest: Koa.Request) {
          return myRequest;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen()).get('/foo').expect(200);
      expect(fooResult.body).to.haveOwnProperty('method');
    });

    it('should inject res', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.Res() res: http.ServerResponse) {
          return typeof res;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen()).get('/foo').expect(200);
      expect(fooResult.text).to.equal('object');
    });

    it('should inject Response', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.Response() response: Koa.Response) {
          return response;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen()).get('/foo').expect(200);
      expect(fooResult.body).to.haveOwnProperty('status');
    });

    xit('should inject body', async () => {
      // koa-better-body doesn't put things in context.request.body
      // but koa-body does, I'll keep this out for now
      @TL.Controller()
      class MyController {
        @TL.Post('/foo')
        foo(@TL.Body() body) {
          return body || {};
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .post('/foo')
        .type('csv')
        .send('foo,bar')
        .expect(200);
      expect(fooResult.body).to.equal('foo,bar');
    });

    it('should inject fields', async () => {
      @TL.Controller()
      class MyController {
        @TL.Post('/foo')
        foo(@TL.Fields() fields) {
          return fields || {};
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .post('/foo')
        .type('form')
        .send({ foo: 'bar'})
        .expect(200);
      expect(fooResult.body).to.deep.equal({ foo: 'bar' });
    });

    it('should inject query params', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.QueryParam() qParams) {
          return qParams;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .get('/foo')
        .query({ foo: 'bar' })
        .expect(200);
      expect(fooResult.body).to.deep.equal({ foo: 'bar' });
    });

    it('should inject a single query param', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.QueryParam('foo') qParams) {
          return qParams;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .get('/foo')
        .query({ foo: 'bar' })
        .expect(200);
      expect(fooResult.text).to.equal('bar');
    });

    it('should inject query params (QueryParams decorator)', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo')
        foo(@TL.QueryParams() qParams) {
          return qParams;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .get('/foo')
        .query({ foo: 'bar' })
        .expect(200);
      expect(fooResult.body).to.deep.equal({ foo: 'bar' });
    });

    it('should inject url params', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo/:foo')
        foo(@TL.Param() params) {
          return params;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .get('/foo/bar')
        .expect(200);
      expect(fooResult.body).to.deep.equal({ foo: 'bar' });
    });

    it('should inject a single url param', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo/:foo')
        foo(@TL.Param('foo') foo) {
          return foo;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .get('/foo/bar')
        .expect(200);
      expect(fooResult.text).to.equal('bar');
    });

    it('should inject url params (Params)', async () => {
      @TL.Controller()
      class MyController {
        @TL.Get('/foo/:foo')
        foo(@TL.Params() params) {
          return params;
        }
      }

      const fooResult = await request(setupKoa([MyController]).listen())
        .get('/foo/bar')
        .expect(200);
      expect(fooResult.body).to.deep.equal({ foo: 'bar' });
    });
  });
});
