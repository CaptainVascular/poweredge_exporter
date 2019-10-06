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
var child_process_1 = require("child_process");
var prom_client_1 = require("prom-client");
var stat_1 = require("./stat");
var config = require('../config');
var gauges = new Map();
var Command = /** @class */ (function () {
    function Command(cmd, labelDetail) {
        var _this = this;
        this.cmd = cmd;
        this.labelDetail = labelDetail;
        this.load = this.run().then(function (output) {
            for (var _i = 0, output_1 = output; _i < output_1.length; _i++) {
                var line = output_1[_i];
                if (!line)
                    continue;
                var stat = new _this.Stat(_this.labelDetail);
                stat.parse(line);
                gauges.has(stat.id) || gauges.set(stat.id, new prom_client_1.Gauge({ name: stat.id, help: stat.label, labelNames: _this.labelNames }));
                console.log('Registered stat: ' + stat.label);
            }
        });
    }
    Command.prototype.update = function () {
        var _this = this;
        return this.run().then(function (output) {
            for (var _i = 0, output_2 = output; _i < output_2.length; _i++) {
                var line = output_2[_i];
                if (!line)
                    continue;
                var stat = new _this.Stat(_this.labelDetail);
                stat.parse(line);
                var gauge = gauges.get(stat.id);
                if (gauge)
                    stat.push(gauge);
            }
        }, function (error) {
            console.error(error);
        });
    };
    Command.prototype.run = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            child_process_1.exec(_this.cmd, function (error, stdout) {
                if (error)
                    return reject(error);
                resolve(stdout.toString().split('\n'));
            });
        });
    };
    return Command;
}());
exports.Command = Command;
var DellCommand = /** @class */ (function (_super) {
    __extends(DellCommand, _super);
    function DellCommand(dellArgs, labelDetail) {
        var _this = _super.call(this, config.dellCmd + " " + dellArgs, labelDetail) || this;
        _this.Stat = stat_1.DellStat;
        _this.labelNames = ['label', 'unit'];
        return _this;
    }
    return DellCommand;
}(Command));
exports.DellCommand = DellCommand;
var SensorCommand = /** @class */ (function (_super) {
    __extends(SensorCommand, _super);
    function SensorCommand() {
        var _this = _super.call(this, config.sensorCmd) || this;
        _this.Stat = stat_1.SensorStat;
        _this.labelNames = ['id', 'label', 'unit'];
        return _this;
    }
    return SensorCommand;
}(Command));
exports.SensorCommand = SensorCommand;
//# sourceMappingURL=command.js.map