import { Controller, Get, Use, Param, Body, Delete, Put, Post, QueryParam } from '../';

export interface Test {
  name: string;
  id: string;
}

@Controller('/profile')
export class ProfileController {

  @Get()
  getAll(@QueryParam('filter') filter: string): Test[] {
    // return []
  }

  @Get('/:id')
  getOne(@Param('id') id: string): Test {
    // return {}
  }

  @Post()
  create(@Body() body: Test): Test {
    // return {}
  }

  @Post('/:id/upload')
  upload(@Param('id') id: string, @File() file): void {
    // return {}
  }

  @Put('/:id')
  update(@Param('id') id: string, @Body() body: Test): Test {
    // return {}
  }

  @Delete('/:id')
  destroy(@Param('id') id: string): void {
    // return success
  }

}
