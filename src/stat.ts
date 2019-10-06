import {Gauge} from 'prom-client';

const config = require('../config');

export abstract class Stat {
	public abstract readonly prefix: string;
	public id: string;
	public label: string;
	public value: number;
	public unit: string;
	public idNumber: number;

	public abstract parse(rawData: string): void;

	constructor(public labelDetail?: string) {}

	protected set(label: string, value: string, unit: string, idNumber?: string): void {
		this.label = label + (this.labelDetail ? ` (${this.labelDetail})` : '');
		this.id = `${config.prefix}_${this.prefix}_` + label.replace(/\s+/g, '_').replace(/[^\w_-]+/g, '').toLowerCase();
		this.value = parseFloat(value);
		this.unit = unit;
		if (idNumber) this.idNumber = parseInt(idNumber);
	}

	public push(gauge: Gauge): void {
		const labelValues: any = {label: this.label, unit: this.unit};
		if (this.idNumber !== undefined) labelValues.id = this.idNumber;
		gauge.set(labelValues, this.value);
	}
}

export class DellStat extends Stat {
	public readonly prefix = 'dell';

	public parse(rawData: string) {
		const [, label, value, unit] = rawData.match(/^(.+?)\s*:\s*([\d\.]+)\s*(\w*).*?$/);
		this.set(label, value, unit);
	}
}

export class SensorStat extends Stat {
	public readonly prefix = 'ipmi';

	public parse(rawData: string) {
		let [id, name, type, reading, units, event] = rawData.split('|').map((value) => value.trim());
		const fan = name.match(/^FAN (\d+) RPM$/i);
		if (fan) {
			name = 'Fan Speed';
			this.labelDetail = 'Fan ' + fan[1];
		}
		this.set(name, reading, units, id);
	}
}
