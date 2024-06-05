import { Interval, Timer } from "./db"

// returns total length of the provided timer
const getTotalTime = (timer: Timer) => {
    return timer.intervals.reduce<number>((sum: number, int: Interval) => {
        const intTime: number = int.length * (int.repeat && timer !== undefined ? timer.rounds : 1); 

        return sum + intTime;
    }, 0);
}

export default getTotalTime;