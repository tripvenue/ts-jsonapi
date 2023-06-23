export declare class DeserializerUtils {
    jsonapi: any;
    data: any;
    opts: any;
    constructor(jsonapi: any, data: any, opts: any);
    private alreadyIncluded;
    private isComplexType;
    private getValueForRelationship;
    private findIncluded;
    private extractAttributes;
    private extractRelationships;
    private keyForAttribute;
    private extractIncludes;
    perform(): any;
}
