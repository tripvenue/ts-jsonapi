"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var serializer_utils_1 = require("./serializer-utils");
var _ = require("lodash");
var Serializer = (function () {
    function Serializer(collectionName, opts) {
        this.collectionName = collectionName;
        this.opts = opts;
        this.payload = {};
    }
    Serializer.prototype.serialize = function (data) {
        if (this.opts.topLevelLinks) {
            this.payload.links = this.getLinks(this.opts.topLevelLinks, data);
        }
        if (this.opts.meta) {
            this.payload.meta = this.opts.meta;
        }
        if (_.isArray(data)) {
            return this.collection(data);
        }
        else {
            return this.resource(data);
        }
    };
    Serializer.prototype.collection = function (data) {
        var _this = this;
        this.payload.data = [];
        data.forEach(function (record) {
            var serializerUtils = new serializer_utils_1.SerializerUtils(_this.collectionName, record, _this.payload, _this.opts);
            _this.payload.data.push(serializerUtils.perform());
        });
        return this.payload;
    };
    Serializer.prototype.resource = function (data) {
        this.payload.data = new serializer_utils_1.SerializerUtils(this.collectionName, data, this.payload, this.opts)
            .perform();
        return this.payload;
    };
    Serializer.prototype.getLinks = function (links, data) {
        return _.mapValues(links, function (value) {
            if (_.isFunction(value)) {
                return value(data);
            }
            else {
                return value;
            }
        });
    };
    return Serializer;
}());
exports.Serializer = Serializer;
//# sourceMappingURL=serializer.js.map