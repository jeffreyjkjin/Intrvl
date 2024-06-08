<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import TimerProgress from '../components/TimerProgress.vue'
import { Interval, Timer } from '../utilities/db'
import getTimer from '../utilities/getTimer'
import playSound from '../utilities/playSound'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();

const timer = ref<Timer>();

// constants for timer
const numIntervals = ref<number>(0);
const totalRounds = ref<number>(0);

// tracking time/rounds
const currentRound = ref<number>(0);
const expectedTime = ref<number>(0);
const ms = ref<number>(0);
const remainingTime = ref<number>(0);
const roundTime = ref<number>(0);

// timer booleans
const timerPause = ref<boolean>(false);
const timerStarted = ref<boolean>(false);

const timerColour = ref<string>('');


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

const runInterval = () => {
    // if timer ended
    if (!timerStarted.value) return;

    // adjust timer for drift
    const delta: number = Date.now() - expectedTime.value;

    if (delta > 10) expectedTime.value += 10 * Math.floor(delta / 10);
    else expectedTime.value += 10;
    
    setTimeout(runInterval, Math.max(0, 10 - delta));
    
    // stop timer countdown if paused
    if (timerPause.value) return;

    // update milliseconds based on drift
    if (delta > 10) ms.value += 10 * Math.floor(delta / 10);
    else ms.value += 10;

    // wait until at least 1 second has passed before incrementing timers
    if (ms.value < 1000) return;
    ms.value = 0;

    roundTime.value--;
    remainingTime.value--;

    const intervals: Interval[] = (timer.value as Timer).intervals;
    const intervalIndex: number = currentRound.value % numIntervals.value;

    // play warning sound
    if (roundTime.value === intervals[intervalIndex].warningTime) {
        playSound(intervals[intervalIndex].warning);
    } 

    // when timer finishes
    if (!remainingTime.value) {
        playSound(intervals[intervalIndex].sound);

        timerStarted.value = false;

        return;
    };
            
    // when interval finishes
    if (!roundTime.value) {
        playSound(intervals[intervalIndex].sound);

        // find next interval with repeat on
        do {
            currentRound.value++;
        } while (currentRound.value >= numIntervals.value && !intervals[currentRound.value % numIntervals.value].repeat);

        roundTime.value = intervals[currentRound.value % numIntervals.value].length;
    }
}

// sets an interval for the timer and clears it when the timer is done
const startTimer = () => {
    // set up timer
    currentRound.value = 0;
    ms.value = 0;
    remainingTime.value = getTotalTime(totalRounds.value);
    roundTime.value = (timer.value as Timer).intervals[0].length;

    timerStarted.value = true;

    expectedTime.value = Date.now() + 10;

    setTimeout(runInterval, 10);
}

// rewinds current round by one
const rewind = () => {
    // if current round is the first one
    if (currentRound.value === 0) return;

    const intervals: Interval[] = (timer.value as Timer).intervals;
    playSound(intervals[currentRound.value % numIntervals.value].sound);

    // find last interval with repeat on
    do {
        currentRound.value--;
    } while (currentRound.value >= numIntervals.value && !intervals[currentRound.value % numIntervals.value].repeat);  

    remainingTime.value = getTotalTime(totalRounds.value - currentRound.value);
    roundTime.value = intervals[currentRound.value % numIntervals.value].length;
}

// skips current round
const forward = () => {
    // if current round is the last one
    if (currentRound.value === totalRounds.value - 1) return;

    const intervals: Interval[] = (timer.value as Timer).intervals;
    playSound(intervals[currentRound.value % numIntervals.value].sound);

    // find next interval with repeat on
    do {
        currentRound.value++;
    } while (currentRound.value >= numIntervals.value && !intervals[currentRound.value % numIntervals.value].repeat);
    
    remainingTime.value = getTotalTime(totalRounds.value - currentRound.value);
    roundTime.value = intervals[currentRound.value % numIntervals.value].length;
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer(Number(route.params.datetime))
        .then((res: Timer) => timer.value = res)
        .then(() => {
            // get number of intervals and rounds
            numIntervals.value = (timer.value as Timer).intervals.length;
            totalRounds.value = (timer.value as Timer).rounds * numIntervals.value;
        })
        .then(() => {
            // initialize timer values
            currentRound.value = 0;
            ms.value = 0;
            remainingTime.value = getTotalTime(totalRounds.value);
            roundTime.value = (timer.value as Timer).intervals[0].length;

            // set initial colour
            timerColour.value = (timer.value as Timer).intervals[0].colour;
        })
        .catch(() => router.push('/error'));
});

// update background colour when round changes
watch(currentRound, () => {
    timerColour.value = (timer.value as Timer).intervals[currentRound.value % numIntervals.value].colour;
});
</script>

<template>
    <div v-if="timer !== undefined" :style="{ backgroundColor: timerColour }">
        <div>
            <RouterLink :to="'/timer/' + timer.datetime">
                Back
            </RouterLink>
        </div>
        {{ timer.name }}
        <div v-if="!timerStarted">
            <button @click="startTimer">
                Start
            </button>
        </div>
        <div v-else>
            <div v-if="!timerPause">
                <button @click="timerPause = true">
                    Pause
                </button>
            </div>
            <div v-else>
                <button @click="timerPause = false">
                    Unpause
                </button>
            </div>
            <div>
                <button @click="rewind">
                    Rewind
                </button>
                <button @click="forward">
                    Forward
                </button>
            </div>
        </div>
        <TimerProgress :seconds="roundTime" :ms="ms" :interval="timer.intervals[currentRound % numIntervals]" />
        <div>
            Remaining Time: {{ remainingTime }}
        </div>
    </div>
</template>