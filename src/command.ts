import {exec} from 'child_process';
import {Gauge} from 'prom-client';
import {DellStat, SensorStat} from './stat';

const config = require('../config');
const gauges: Map<string, Gauge> = new Map();

export abstract class Command {
	protected abstract Stat: typeof DellStat | typeof SensorStat;
	protected abstract labelNames: string[];
	public load: Promise<void>;

	constructor(public cmd: string, public labelDetail?: string) {
		this.load = this.run().then((output) => {
			for (const line of output) {
				if (!line) continue;
				const stat = new this.Stat(this.labelDetail);
				stat.parse(line);
				gauges.has(stat.id) || gauges.set(stat.id, new Gauge({name: stat.id, help: stat.label, labelNames: this.labelNames}));
				console.log('Registered stat: ' + stat.label);
			}
		});
	}

	public update(): Promise<void> {
		return this.run().then((output) => {
			for (const line of output) {
				if (!line) continue;
				const stat = new this.Stat(this.labelDetail);
				stat.parse(line);
				const gauge = gauges.get(stat.id);
				if (gauge) stat.push(gauge);
			}
		}, (error) => {
			console.error(error);
		});
	}

	public run(): Promise<string[]> {
		return new Promise((resolve, reject) => {
			exec(this.cmd, (error, stdout) => {
				if (error) return reject(error);
				resolve(stdout.toString().split('\n'));
			});
		});
	}
}

export class DellCommand extends Command {
	protected Stat = DellStat;
	protected labelNames = ['label', 'unit'];

	constructor(dellArgs: string, labelDetail?: string) {
		super(`${config.dellCmd} ${dellArgs}`, labelDetail);
	}
}

export class SensorCommand extends Command {
	protected Stat = SensorStat;
	protected labelNames = ['id', 'label', 'unit'];

	constructor() {
		super(config.sensorCmd);
	}
}
