import Dexie, { Table } from 'dexie'

/**
 * An interval used in a timer.
 * 
 * @field {string} name - Name of the interval.
 * @field {string} string - Colour of the interval.
 * @field {number} length - Length of the interval.
 * @field {string} warning - Sound that plays when the interval reaches the warning time.
 * @field {number} warningTime - The time in the interval where a warning sound will be played.
 * @field {string} sound - Sound that plays when the interval ends.
 * @field {boolean} repeat - Interval repeats when the number of rounds is greater than 1.
 */
export interface Interval {
    name: string;
    colour: string;
    length: number;
    warning: string;
    warningTime: number;
    sound: string;
    repeat: boolean;
}

/**
 * Stores data for an interval timer.
 * 
 * @field {number} datetime - Unix time of when the timer was created. Used as a key in TimerStorage.
 * @field {string} name - Name of the timer.
 * @field {number} rounds - The number of rounds that the intervals will be repeated.
 * @field {Interval[]} intervals - The intervals that make up the timer.
 */
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

export const timers = new TimerStorage();