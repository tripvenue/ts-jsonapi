"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var inflector_1 = require("./inflector");
var DeserializerUtils = (function () {
    function DeserializerUtils(jsonapi, data, opts) {
        this.jsonapi = jsonapi;
        this.data = data;
        this.opts = opts;
        this.extractedObjects = {};
    }
    DeserializerUtils.prototype.isComplexType = function (obj) {
        return _.isArray(obj) || _.isPlainObject(obj);
    };
    DeserializerUtils.prototype.getValueForRelationship = function (relationshipData, included) {
        if (this.opts && relationshipData && this.opts[relationshipData.type]) {
            var valueForRelationshipFct = this.opts[relationshipData.type]
                .valueForRelationship;
            return valueForRelationshipFct(relationshipData, included);
        }
        else if (!included && relationshipData) {
            return { id: relationshipData.id };
        }
        else {
            return included;
        }
    };
    DeserializerUtils.prototype.findIncluded = function (relationshipData) {
        if (!this.jsonapi.included || !relationshipData) {
            return null;
        }
        var included = _.find(this.jsonapi.included, {
            id: relationshipData.id,
            type: relationshipData.type
        });
        if (included) {
            var relationshipKey = relationshipData.type + ":" + relationshipData.id;
            if (!this.extractedObjects.hasOwnProperty(relationshipKey)) {
                var attributes = this.extractAttributes(included);
                this.extractedObjects[relationshipKey] = attributes;
                _.extend(attributes, this.extractRelationships(included));
            }
            return this.extractedObjects[relationshipKey];
        }
        else {
            return null;
        }
    };
    DeserializerUtils.prototype.extractAttributes = function (from) {
        var dest = this.keyForAttribute(from.attributes || {});
        if ('id' in from) {
            dest.id = from.id;
        }
        if ('type' in from) {
            dest.type = from.type;
        }
        return dest;
    };
    DeserializerUtils.prototype.extractRelationships = function (from) {
        var _this = this;
        if (!from.relationships) {
            return;
        }
        var dest = {};
        Object.keys(from.relationships)
            .map(function (key) {
            var relationship = from.relationships[key];
            if (relationship.data === null) {
                return dest[_this.keyForAttribute(key)] = null;
            }
            else if (_.isArray(relationship.data)) {
                var includes = relationship.data
                    .map(function (relationshipData) {
                    return _this.extractIncludes(relationshipData);
                });
                if (includes) {
                    dest[_this.keyForAttribute(key)] = includes;
                }
            }
            else {
                var includes = _this.extractIncludes(relationship.data);
                if (includes) {
                    return dest[_this.keyForAttribute(key)] = includes;
                }
            }
        });
        return dest;
    };
    DeserializerUtils.prototype.keyForAttribute = function (attribute) {
        var _this = this;
        if (_.isPlainObject(attribute)) {
            return _.transform(attribute, function (result, value, key) {
                if (_this.isComplexType(value)) {
                    result[_this.keyForAttribute(key)] = _this.keyForAttribute(value);
                }
                else {
                    result[_this.keyForAttribute(key)] = value;
                }
            });
        }
        else if (_.isArray(attribute)) {
            return attribute.map(function (attr) {
                if (_this.isComplexType(attr)) {
                    return _this.keyForAttribute(attr);
                }
                else {
                    return attr;
                }
            });
        }
        else {
            if (_.isFunction(this.opts.keyForAttribute)) {
                return this.opts.keyForAttribute(attribute);
            }
            else {
                return inflector_1.Inflector.caserize(attribute, this.opts.keyForAttribute);
            }
        }
    };
    DeserializerUtils.prototype.extractIncludes = function (relationshipData) {
        var included = this.findIncluded(relationshipData);
        return this.getValueForRelationship(relationshipData, included);
    };
    DeserializerUtils.prototype.perform = function () {
        return _.extend(this.extractAttributes(this.data), this.extractRelationships(this.data));
    };
    return DeserializerUtils;
}());
exports.DeserializerUtils = DeserializerUtils;
//# sourceMappingURL=deserializer-utils.js.map