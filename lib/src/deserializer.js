"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var deserializer_utils_1 = require("./deserializer-utils");
var Deserializer = (function () {
    function Deserializer(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = opts;
    }
    Deserializer.prototype.deserialize = function (jsonapi) {
        if (_.isArray(jsonapi.data)) {
            return this.collection(jsonapi);
        }
        else {
            return this.resource(jsonapi);
        }
    };
    Deserializer.prototype.collection = function (jsonapi) {
        var _this = this;
        return _.map(jsonapi.data, function (d) {
            return new deserializer_utils_1.DeserializerUtils(jsonapi, d, _this.opts).perform();
        });
    };
    Deserializer.prototype.resource = function (jsonapi) {
        return new deserializer_utils_1.DeserializerUtils(jsonapi, jsonapi.data, this.opts)
            .perform();
    };
    return Deserializer;
}());
exports.Deserializer = Deserializer;
//# sourceMappingURL=deserializer.js.map