import { SerializerOptions } from './serializer-options';
export declare class SerializerUtils {
    collectionName: string;
    record: any;
    payload: any;
    opts: SerializerOptions;
    constructor(collectionName: string, record: any, payload: any, opts: SerializerOptions);
    serialize(dest: any, current: any, attribute: any, opts: SerializerOptions): void;
    serializeRef(dest: any, current: any, attribute: any, opts: SerializerOptions): any;
    serializeNested(dest: any, current: any, attribute: string, opts: SerializerOptions): any;
    perform(): any;
    private keyForAttribute;
    private isComplexType;
    private getRef;
    private getId;
    private getType;
    private getLinks;
    private getMeta;
    private pick;
    private isCompoundDocumentIncluded;
    private pushToIncluded;
}
