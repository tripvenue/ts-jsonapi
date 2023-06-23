import { SerializerOptions } from './serializer-options';
import { Links } from './types';
import * as _ from 'lodash';
export declare class Serializer {
    collectionName: string;
    opts: SerializerOptions;
    private payload;
    constructor(collectionName: string, opts: SerializerOptions);
    serialize(data: any): any;
    collection(data: any): any;
    resource(data: any): any;
    getLinks(links: Links, data: Array<any>): _.Dictionary<string>;
}
