import { Controller, Get, Use, Param, File, Body, Delete, Put, Post, QueryParam } from 'trafficlight';

export interface Test {
    name?: string;
    id?: string;
}

@Controller('/profile')
export class ProfileController {

    /**
     * Get all the profiles
     */
    @Get()
    getAll(@QueryParam('filter') filter?: string): Test[] {
        return []
    }

    /**
     * Get a profile by id
     */
    @Get('/:id')
    getOne(@Param('id') id: string): Test {
        return {}
    }

    @Post()
    create(@Body() body: Test): Test {
        return {}
    }

    @Post('/:id/upload')
    upload(@Param('id') id: string, @File() file: any): void {
        // return {}
    }

    @Put('/:id')
    update(@Param('id') id: string, @Body() body: Test): Test {
        return {}
    }

    @Delete('/:id')
    destroy(@Param('id') id: string): void {
        // return success
    }

}

const swagger = require('./swagger.json');

@Controller('/swagger')
export class SwaggerController {
    @Get('/spec.json')
    getSpec(): string {
        return JSON.stringify(swagger, null, 4);
    }
}
