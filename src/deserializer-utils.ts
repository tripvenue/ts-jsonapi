import * as _ from 'lodash';
import { Inflector } from './inflector';

export class DeserializerUtils {

  constructor(
    public jsonapi: any,
    public data: any,
    public opts: any
  ){}

  private extractedObjects: any = {};

  private isComplexType(obj: any) {
    return _.isArray(obj) || _.isPlainObject(obj);
  }

  private getValueForRelationship(relationshipData: any, included: any) {
    if (this.opts && relationshipData && this.opts[relationshipData.type]) {
      let valueForRelationshipFct = this.opts[relationshipData.type]
        .valueForRelationship;

      return valueForRelationshipFct(relationshipData, included);
    } else if (!included && relationshipData) {
        return {id: relationshipData.id}
    } else {
      return included;
    }
  }

  private findIncluded(relationshipData: any) {
    if (!this.jsonapi.included || !relationshipData) {
      return null;
    }

    let included = _.find(this.jsonapi.included, {
      id: relationshipData.id,
      type: relationshipData.type
    });

    if (included) {
      const relationshipKey = `${relationshipData.type}:${relationshipData.id}`;

      if (!this.extractedObjects.hasOwnProperty(relationshipKey)) {
        let attributes = this.extractAttributes(included);
        this.extractedObjects[relationshipKey] = attributes;
        _.extend(attributes, this.extractRelationships(included));
      }

      return this.extractedObjects[relationshipKey];
    } else {
      return null;
    }
  }

  private extractAttributes(from: any) {
    let dest = this.keyForAttribute(from.attributes || {});
    if ('id' in from) {
      dest.id = from.id;
    }
    if ('type' in from) {
      dest.type = from.type;
    }

    return dest;
  }

  private extractRelationships(from: any): any {
    if (!from.relationships) { return; }

    let dest: any = {};

    Object.keys(from.relationships)
      .map((key: string) => {
        let relationship = from.relationships[key];

        if (relationship.data === null) {
          return dest[this.keyForAttribute(key)] = null;
        } else if (_.isArray(relationship.data)) {
          let includes = relationship.data
            .map((relationshipData: Array<any>) => {
              return this.extractIncludes(relationshipData);
            });
          if (includes) {
              dest[this.keyForAttribute(key)] = includes;
          }
        } else {
          let includes = this.extractIncludes(relationship.data)
          if (includes) {
            return dest[this.keyForAttribute(key)] = includes;
          }
        }
      });
      return dest;
  }

  private keyForAttribute(attribute: any): any{
    if (_.isPlainObject(attribute)) {
      return _.transform(attribute, (result, value, key) => {
        if (this.isComplexType(value)) {
          result[this.keyForAttribute(key)] = this.keyForAttribute(value);
        } else {
          result[this.keyForAttribute(key)] = value;
        }
      });
    } else if (_.isArray(attribute)) {
      return attribute.map(attr => {
        if (this.isComplexType(attr)) {
          return this.keyForAttribute(attr);
        } else {
          return attr;
        }
      });
    } else {
      if (_.isFunction(this.opts.keyForAttribute)) {
        return this.opts.keyForAttribute(attribute);
      } else {
        return Inflector.caserize(attribute, this.opts.keyForAttribute);
      }
    }
  }

  private extractIncludes(relationshipData: any) {
    let included = this.findIncluded(relationshipData)
    return this.getValueForRelationship(relationshipData, included);
  }

  perform(): any {
    return _.extend(this.extractAttributes(this.data), this.extractRelationships(this.data));
  }
}
