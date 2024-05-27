import Dexie, { Table } from 'dexie'

// interval in a timer
export interface Interval {
    name: string;
    colour: string;
    length: number;
    warning: string;
    warningTime: number;
    sound: string;
    repeat: boolean;
}

// stores data for an interval timer
export interface Timer {
    datetime: number;
    name: string;
    rounds: number;
    intervals: Interval[]; 
}

export class TimerStorage extends Dexie {
    timers!: Table<Timer>;

    constructor() {
        super('TimerStorage');
        this.version(1).stores({
            timers: 'datetime, name, rounds, intervals'
        });
    }
}

export const db = new TimerStorage();