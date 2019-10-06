import {exec} from 'child_process';
import {Gauge} from 'prom-client';
import {DellStat, SensorStat} from './stat';

const config = require('../config');

export abstract class Command {
	public abstract Stat: typeof DellStat | typeof SensorStat;
	public gauges: Map<string, Gauge> = new Map();
	public load: Promise<void>;

	constructor(public cmd: string, public labelDetail?: string) {
		this.load = this.run().then((output) => {
			for (const line of output) {
				if (!line) continue;
				const stat = new this.Stat(this.labelDetail);
				stat.parse(line);
				const gauge = new Gauge({name: stat.id, help: stat.label, labelNames: ['label', 'unit']});
				stat.push(gauge);
				this.gauges.set(stat.id, gauge);
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
				const gauge = this.gauges.get(stat.id);
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
	public Stat = DellStat;

	constructor(dellArgs: string, labelDetail?: string) {
		super(`${config.dellCmd} ${dellArgs}`, labelDetail);
	}
}

export class SensorCommand extends Command {
	public Stat = SensorStat;

	constructor() {
		super(config.sensorCmd);
	}
}
