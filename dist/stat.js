"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var config = require('../config');
var Stat = /** @class */ (function () {
    function Stat(labelDetail) {
        this.labelDetail = labelDetail;
    }
    Stat.prototype.set = function (label, value, unit, idNumber) {
        this.label = label + (this.labelDetail ? " (" + this.labelDetail + ")" : '');
        this.id = config.prefix + "_" + this.prefix + "_" + label.replace(/\s+/g, '_').replace(/[^\w_-]+/g, '').toLowerCase();
        this.value = parseFloat(value);
        this.unit = unit;
        if (idNumber)
            this.idNumber = parseInt(idNumber);
    };
    Stat.prototype.push = function (gauge) {
        var labelValues = { label: this.label, unit: this.unit };
        if (this.idNumber !== undefined)
            labelValues.id = this.idNumber;
        gauge.set(labelValues, this.value);
    };
    return Stat;
}());
exports.Stat = Stat;
var DellStat = /** @class */ (function (_super) {
    __extends(DellStat, _super);
    function DellStat() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = 'dell';
        return _this;
    }
    DellStat.prototype.parse = function (rawData) {
        var _a = rawData.match(/^(.+?)\s*:\s*([\d\.]+)\s*(\w*).*?$/), label = _a[1], value = _a[2], unit = _a[3];
        this.set(label, value, unit);
    };
    return DellStat;
}(Stat));
exports.DellStat = DellStat;
var SensorStat = /** @class */ (function (_super) {
    __extends(SensorStat, _super);
    function SensorStat() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prefix = 'ipmi';
        return _this;
    }
    SensorStat.prototype.parse = function (rawData) {
        var _a = rawData.split('|').map(function (value) { return value.trim(); }), id = _a[0], name = _a[1], type = _a[2], reading = _a[3], units = _a[4], event = _a[5];
        var fan = name.match(/^FAN (\d+) RPM$/i);
        if (fan) {
            name = 'Fan Speed';
            this.labelDetail = 'Fan ' + fan[1];
        }
        this.set(name, reading, units, id);
    };
    return SensorStat;
}(Stat));
exports.SensorStat = SensorStat;
//# sourceMappingURL=stat.js.map