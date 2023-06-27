"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inflector = require("inflected");
var Inflector;
(function (Inflector) {
    function caserize(attribute, conversionCase) {
        attribute = inflector.underscore(attribute);
        switch (conversionCase) {
            case 'dash-case':
            case 'lisp-case':
            case 'spinal-case':
            case 'kebab-case':
                return inflector.dasherize(attribute);
            case 'underscore_case':
            case 'snake_case':
                return attribute;
            case 'CamelCase':
                return inflector.camelize(attribute);
            case 'camelCase':
                return inflector.camelize(attribute, false);
            default:
                return inflector.dasherize(attribute);
        }
    }
    Inflector.caserize = caserize;
    function pluralize(attribute) {
        return inflector.pluralize(attribute);
    }
    Inflector.pluralize = pluralize;
})(Inflector = exports.Inflector || (exports.Inflector = {}));
//# sourceMappingURL=inflector.js.map