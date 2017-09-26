import 'reflect-metadata';
import * as TL from '../../src/';
import * as http from 'http';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as koaBody from 'koa-better-body';
import * as request from 'supertest';
import { expect } from 'chai';
import * as Temp from 'temp';
import * as fs from 'fs';

Temp.track(); // cleanup temp files

describe('Koa - Bindings', () => {
  function setupKoa(controllers: any[]): Koa {
    const app = new Koa();
    app.use(koaBody({}));

    const router = new Router();
    TL.bindRoutes(router, controllers);
    app.use(router.routes());
    app.use(router.allowedMethods());

    return app;
  }

  describe('File Downloads', () => {
    it('should download plain text (csv)', async () => {
      const contents = 'col1,col2\nfield1,field2';

      @TL.Controller()
      class MyController {
        @TL.Get()
        getTest() {
          return new TL.FileDownload(contents, 'test.csv', 'text/csv');
        }
      }

      const result = await request(setupKoa([MyController]).listen()).get('/').expect(200);
      expect(result.header['content-type']).to.contain('text/csv');
      expect(result.header['content-disposition']).to.contain('test.csv');
      expect(result.text).to.equal(contents);
    });

    it('should download a streamed file', async () => {
      const contents = 'foo\nbar\nfizz\buzz';

      @TL.Controller()
      class MyController {
        @TL.Get()
        getTest() {

          // create a temp file to stream
          const tempFile = Temp.openSync();
          fs.writeFileSync(tempFile.fd, contents);
          fs.closeSync(tempFile.fd);

          const fileStream = fs.createReadStream(tempFile.path);
          return new TL.FileDownload(fileStream, 'test.txt', 'text/plain');
        }
      }

      const result = await request(setupKoa([MyController]).listen()).get('/').expect(200);
      expect(result.header['content-type']).to.contain('text/plain');
      expect(result.header['content-disposition']).to.contain('test.txt');
      expect(result.text).to.equal(contents);
    });
  });
});
