import { db, Timer } from "./db"

// gets timer corresponding to provided datetime; throws error if not found
const getTimer = async (datetime: number): Promise<Timer> => {
    const t: Timer | undefined = await db.timers.get(datetime);

    if (t === undefined) {
        throw Error();
    }

    return t;
}

export default getTimer;