export declare class Deserializer {
    opts: any;
    constructor(opts?: any);
    deserialize(jsonapi: any): any;
    collection(jsonapi: any): any[];
    resource(jsonapi: any): any;
}
