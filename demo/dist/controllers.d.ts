export interface Test {
    name?: string;
    id?: string;
}
export declare class ProfileController {
    getAll(filter?: string): Test[];
    getOne(id: string): Test;
    create(body: Test): Test;
    upload(id: string, file: any): void;
    update(id: string, body: Test): Test;
    destroy(id: string): void;
}
export declare class SwaggerController {
    getSpec(): string;
}
