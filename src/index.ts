import {DellCommand, SensorCommand} from './command';
import {register} from 'prom-client';
import {createServer} from 'http';

const config = require('../config');

const commands = [
	new DellCommand('get-instantaneous-power-consumption-data 0', 'Total'),
	new DellCommand('get-instantaneous-power-consumption-data 1', 'PSU1'),
	new DellCommand('get-instantaneous-power-consumption-data 2', 'PSU2'),
	new SensorCommand()
];

Promise.all(commands.map((command) => command.load)).then(() => {
	
	const server = createServer((req, res) => {
		Promise.all(commands.map((command) => command.update())).then(() => {
			res.end(register.metrics());
		});
	});
	server.listen(config.port, () => {
		console.log('Listening on port ' + config.port);
	});

}, (error) => {
	console.error(error);
});
