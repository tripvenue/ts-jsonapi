export declare class DeserializerUtils {
    jsonapi: any;
    data: any;
    opts: any;
    constructor(jsonapi: any, data: any, opts: any);
    private extractedObjects;
    private isComplexType;
    private getValueForRelationship;
    private findIncluded;
    private extractAttributes;
    private extractRelationships;
    private keyForAttribute;
    private extractIncludes;
    perform(): any;
}
