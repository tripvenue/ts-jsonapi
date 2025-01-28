"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var inflector_1 = require("./inflector");
var SerializerUtils = (function () {
    function SerializerUtils(collectionName, record, payload, opts) {
        this.collectionName = collectionName;
        this.record = record;
        this.payload = payload;
        this.opts = opts;
    }
    SerializerUtils.prototype.serialize = function (dest, current, attribute, opts) {
        var _this = this;
        var data = null;
        if (opts && opts.ref) {
            if (!dest.relationships) {
                dest.relationships = {};
            }
            if (_.isArray(current[attribute])) {
                data = current[attribute].map(function (item) {
                    return _this.serializeRef(item, current, attribute, opts);
                });
            }
            else {
                data = this.serializeRef(current[attribute], current, attribute, opts);
            }
            dest.relationships[this.keyForAttribute(attribute)] = {};
            if (!opts.ignoreRelationshipData) {
                dest.relationships[this.keyForAttribute(attribute)].data = data;
            }
            if (opts.relationshipLinks) {
                dest.relationships[this.keyForAttribute(attribute)].links =
                    this.getLinks(current[attribute], opts.relationshipLinks, dest);
            }
            if (opts.relationshipMeta) {
                dest.relationships[this.keyForAttribute(attribute)].meta =
                    this.getMeta(current[attribute], opts.relationshipMeta);
            }
        }
        else {
            if (_.isArray(current[attribute])) {
                if (current[attribute].length && _.isPlainObject(current[attribute][0])) {
                    data = current[attribute].map(function (item) {
                        return _this.serializeNested(item, current, attribute, opts);
                    });
                }
                else {
                    data = current[attribute];
                }
                dest.attributes[this.keyForAttribute(attribute)] = data;
            }
            else if (_.isPlainObject(current[attribute])) {
                data = this.serializeNested(current[attribute], current, attribute, opts);
                dest.attributes[this.keyForAttribute(attribute)] = data;
            }
            else {
                dest.attributes[this.keyForAttribute(attribute)] = current[attribute];
            }
        }
    };
    SerializerUtils.prototype.serializeRef = function (dest, current, attribute, opts) {
        var _this = this;
        var id = this.getRef(current, dest, opts);
        var type = this.getType(attribute, dest);
        var relationships = [];
        var includedAttrs = [];
        if (opts.attributes) {
            relationships = opts.attributes.filter(function (attr) {
                return opts[attr];
            });
            includedAttrs = opts.attributes.filter(function (attr) {
                return !opts[attr];
            });
        }
        var included = { type: type, id: id };
        if (includedAttrs) {
            included.attributes = this.pick(dest, includedAttrs);
        }
        _.each(relationships, function (relationship) {
            if (dest && _this.isComplexType(dest[relationship])) {
                _this.serialize(included, dest, relationship, opts[relationship]);
            }
        });
        if (includedAttrs.length &&
            (_.isUndefined(opts.included) || opts.included)) {
            if (opts.includedLinks) {
                included.links = this.getLinks(dest, opts.includedLinks);
            }
            if (typeof id !== 'undefined') {
                this.pushToIncluded(this.payload, included);
            }
        }
        return typeof id !== 'undefined' ? { type: type, id: id } : null;
    };
    ;
    SerializerUtils.prototype.serializeNested = function (dest, current, attribute, opts) {
        var _this = this;
        var embeds = [];
        var attributes = [];
        if (opts && opts.attributes) {
            embeds = opts.attributes.filter(function (attr) {
                return opts[attr];
            });
            attributes = opts.attributes.filter(function (attr) {
                return !opts[attr];
            });
        }
        else {
            embeds = _.keys(dest);
            attributes = _.keys(dest);
        }
        var ret = {};
        if (attributes) {
            ret.attributes = this.pick(dest, attributes);
        }
        _.each(embeds, function (embed) {
            if (_this.isComplexType(dest[embed])) {
                _this.serialize(ret, dest, embed, opts ? opts[embed] : null);
            }
        });
        return ret.attributes;
    };
    SerializerUtils.prototype.perform = function () {
        var _this = this;
        if (_.isNull(this.record)) {
            return null;
        }
        var data = {
            type: this.getType(this.collectionName, this.record),
            id: String(this.record[this.getId()])
        };
        if (this.opts.dataLinks) {
            data.links = this.getLinks(this.record, this.opts.dataLinks);
        }
        if (this.opts.dataMeta) {
            data.meta = this.getMeta(this.record, this.opts.dataMeta);
        }
        _.each(this.opts.attributes, function (attribute) {
            var splittedAttributes = attribute.split(':');
            if (splittedAttributes[0] in _this.record ||
                (_this.opts[attribute] && _this.opts[attribute].nullIfMissing)) {
                if (!data.attributes) {
                    data.attributes = {};
                }
                var attributeMap = attribute;
                if (splittedAttributes.length > 1) {
                    attribute = splittedAttributes[0];
                    attributeMap = splittedAttributes[1];
                }
                _this.serialize(data, _this.record, attribute, _this.opts[attributeMap]);
            }
        });
        return data;
    };
    SerializerUtils.prototype.keyForAttribute = function (attribute) {
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
    SerializerUtils.prototype.isComplexType = function (obj) {
        return _.isArray(obj) || _.isPlainObject(obj);
    };
    SerializerUtils.prototype.getRef = function (current, item, opts) {
        if (_.isFunction(opts.ref)) {
            return opts.ref(current, item);
        }
        else if (opts.ref === true) {
            if (_.isArray(item)) {
                return item.map(function (val) {
                    return String(val);
                });
            }
            else if (item) {
                return String(item);
            }
        }
        else if (item && item[opts.ref]) {
            return String(item[opts.ref]);
        }
    };
    SerializerUtils.prototype.getId = function () {
        return this.opts.id || 'id';
    };
    SerializerUtils.prototype.getType = function (str, attrVal) {
        var type;
        attrVal = attrVal || {};
        if (_.isFunction(this.opts.typeForAttribute)) {
            type = this.opts.typeForAttribute(str, attrVal);
        }
        if ((_.isUndefined(this.opts.pluralizeType) || this.opts.pluralizeType) && _.isUndefined(type)) {
            type = inflector_1.Inflector.pluralize(str);
        }
        if (_.isUndefined(type)) {
            type = str;
        }
        return type;
    };
    SerializerUtils.prototype.getLinks = function (current, links, dest) {
        var _this = this;
        return _.mapValues(links, function (value) {
            if (_.isFunction(value)) {
                return value(_this.record, current, dest);
            }
            else {
                return value;
            }
        });
    };
    SerializerUtils.prototype.getMeta = function (current, meta) {
        var _this = this;
        return _.mapValues(meta, function (value) {
            if (_.isFunction(value)) {
                return value(_this.record, current);
            }
            else {
                return value;
            }
        });
    };
    SerializerUtils.prototype.pick = function (obj, attributes) {
        var _this = this;
        return _.mapKeys(_.pick(obj, attributes), function (value, key) {
            return _this.keyForAttribute(key);
        });
    };
    SerializerUtils.prototype.isCompoundDocumentIncluded = function (included, item) {
        return _.find(this.payload.included, { id: item.id, type: item.type });
    };
    SerializerUtils.prototype.pushToIncluded = function (dest, include) {
        if (!this.isCompoundDocumentIncluded(dest, include)) {
            if (!dest.included) {
                dest.included = [];
            }
            dest.included.push(include);
        }
    };
    return SerializerUtils;
}());
exports.SerializerUtils = SerializerUtils;
//# sourceMappingURL=serializer-utils.js.map