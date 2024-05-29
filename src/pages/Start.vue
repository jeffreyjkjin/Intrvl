<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import { db, Interval, Timer } from '../utilities/db'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const timer = ref<Timer>();

let intervalID: number;

const currentRound = ref<number>(0);
const remainingTime = ref<number>(0);
const roundTime = ref<number>(0);

const numIntervals = ref<number>(0);
const totalRounds = ref<number>(0);

const timerPause = ref<boolean>(false);
const timerStarted = ref<boolean>(false);

// gets timer with datetime param
const getTimer = async (): Promise<Timer> => {
    const t: Timer | undefined = await db.timers.get(Number(route.params.datetime));

    if (t === undefined) {
        throw Error();
    }

    return t;
}

// calculates total time of timer based on number of rounds remaining
const getTotalTime = (rounds: number): number => {
    const intervals: Interval[] = (timer.value as Timer).intervals; 
    let time: number = 0;

    for (let i = 0; i < rounds; i++) {
        const int: Interval = intervals[i % numIntervals.value];

        // only count interval time if is the first round or repeat is enabled
        if (i < numIntervals.value || int.repeat) time = time + int.length;
    }

    return time;
}

// sets an interval for the timer and clears it when the timer is done
const startTimer = () => {
    const intervals: Interval[] = (timer.value as Timer).intervals;

    // set up timer
    currentRound.value = 0;
    remainingTime.value = getTotalTime(totalRounds.value);
    roundTime.value = intervals[0].length;

    timerStarted.value = true;

    intervalID = setInterval(() => {
        if (timerPause.value) return;

        roundTime.value--;
        remainingTime.value--;
        
        if (!remainingTime.value) {
            clearInterval(intervalID);

            timerStarted.value = false;

            return;
        };
            
        if (!roundTime.value) {
            while (!intervals[++currentRound.value % numIntervals.value].repeat);

            roundTime.value = intervals[currentRound.value % numIntervals.value].length;
        } 
    }, 1000);
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer()
        .then((res: Timer) => timer.value = res)
        .then(() => {
            // get number of intervals and rounds
            numIntervals.value = (timer.value as Timer).intervals.length;
            totalRounds.value = (timer.value as Timer).rounds * numIntervals.value;
        })
        .then(() => {
            // initialize times
            remainingTime.value = getTotalTime(totalRounds.value);
            roundTime.value = (timer.value as Timer).intervals[currentRound.value].length;
        })
        .catch(() => router.push('/error'));
});
</script>

<template>
    <div v-if="timer !== undefined">
        {{ timer.name }}
        <div v-if="!timerStarted">
            <button @click="startTimer">
                Start
            </button>
        </div>
        <div v-else-if="!timerPause">
            <button @click="timerPause = true">
                Pause
            </button>
        </div>
        <div v-else>
            <button @click="timerPause = false">
                Unpause
            </button>
        </div>
        <div v-if="numIntervals">
            {{ timer.intervals[currentRound % numIntervals].name }}: {{ roundTime }}
        </div>
        <div>
            Remaining Time: {{ remainingTime }}
        </div>
    </div>
</template>