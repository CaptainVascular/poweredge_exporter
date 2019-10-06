"use strict";
exports.__esModule = true;
var command_1 = require("./command");
var prom_client_1 = require("prom-client");
var http_1 = require("http");
var config = require('../config');
var commands = [
    new command_1.DellCommand('get-instantaneous-power-consumption-data 0', 'Total'),
    new command_1.DellCommand('get-instantaneous-power-consumption-data 1', 'PSU1'),
    new command_1.DellCommand('get-instantaneous-power-consumption-data 2', 'PSU2'),
    new command_1.SensorCommand()
];
Promise.all(commands.map(function (command) { return command.load; })).then(function () {
    var server = http_1.createServer(function (req, res) {
        Promise.all(commands.map(function (command) { return command.update(); })).then(function () {
            res.end(prom_client_1.register.metrics());
        });
    });
    server.listen({ host: config.host, port: config.port }, function () {
        console.log("Listening on " + config.host + ":" + config.port);
    });
}, function (error) {
    console.error(error);
});
//# sourceMappingURL=index.js.map