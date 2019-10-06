import {Gauge} from 'prom-client';

const config = require('../config');

export abstract class Stat {
	public abstract readonly prefix: string;
	public id: string;
	public label: string;
	public value: number;
	public unit: string;

	public abstract parse(rawData: string): void;

	constructor(public labelDetail?: string) {}

	protected set(label: string, value: string, unit: string, idNumber?: string): void {
		this.label = label + (this.labelDetail ? ` (${this.labelDetail})` : '');
		this.id = `${config.prefix}_${this.prefix}_${idNumber ? `${idNumber}_` : ''}` + this.label.replace(/\s+/g, '_').replace(/[^\w_-]+/g, '').toLowerCase();
		this.value = parseFloat(value);
		this.unit = unit;
	}

	public push(gauge: Gauge): void {
		gauge.set({label: this.label, unit: this.unit}, this.value);
	}
}

export class DellStat extends Stat {
	public readonly prefix = 'dell';

	public parse(rawData: string) {
		const [, label, value, unit] = rawData.match(/^(.+?)\s*:\s*([\d\.]+)\s*(\w*).*?$/);
		this.set(label ,value, unit);
	}
}

export class SensorStat extends Stat {
	public readonly prefix = 'ipmi';

	public parse(rawData: string) {
		const [id, name, type, reading, units, event] = rawData.split('|').map((value) => value.trim());
		this.set(name, reading, units, id);
	}
}
