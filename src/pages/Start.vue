<script setup lang="ts">
import Clock from '../icons/clock.svg'
import Close from '../icons/close.svg'
import Forward from '../icons/forward.svg'
import Pause from '../icons/pause.svg'
import Play from '../icons/play.svg'
import Replay from '../icons/replay.svg'
import { onBeforeMount, ref, watch } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import TimerProgress from '../components/TimerProgress.vue'
import { Interval, Timer } from '../utilities/db'
import formatTime from '../utilities/formatTime'
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


// calculates total time of timer based on the current round number
const getCurrentTime = (rounds: number): number => {
    if (!timer.value) return 0;

    const intervals: Interval[] = timer.value.intervals; 
    let time: number = 0;

    for (let i = rounds; i < totalRounds.value; i++) {
        const int: Interval = intervals[i % numIntervals.value];

        // only count interval time if is the first round or repeat is enabled
        if (i < numIntervals.value || int.repeat) time = time + int.length;
    }

    return time;
}

const runInterval = () => {
    if (!timer.value) return;

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

    const intervals: Interval[] = timer.value.intervals;
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
    if (!timer.value) return;

    // set up timer
    currentRound.value = 0;
    ms.value = 0;
    remainingTime.value = getCurrentTime(0);
    roundTime.value = timer.value.intervals[0].length;

    timerStarted.value = true;

    expectedTime.value = Date.now() + 10;

    setTimeout(runInterval, 10);
}

// rewinds current round by one
const rewind = () => {
    if (!timer.value) return;

    // if current round is the first one
    if (currentRound.value === 0) return;

    const intervals: Interval[] = timer.value.intervals;
    playSound(intervals[currentRound.value % numIntervals.value].sound);

    // find last interval with repeat on
    do {
        currentRound.value--;
    } while (currentRound.value >= numIntervals.value && !intervals[currentRound.value % numIntervals.value].repeat);  

    remainingTime.value = getCurrentTime(currentRound.value);
    roundTime.value = intervals[currentRound.value % numIntervals.value].length;
}

// skips current round
const forward = () => {
    if (!timer.value) return;

    // if current round is the last one
    if (currentRound.value === totalRounds.value - 1) return;

    const intervals: Interval[] = timer.value.intervals;
    playSound(intervals[currentRound.value % numIntervals.value].sound);

    // find next interval with repeat on
    do {
        currentRound.value++;
    } while (currentRound.value >= numIntervals.value && !intervals[currentRound.value % numIntervals.value].repeat);
    
    remainingTime.value = getCurrentTime(currentRound.value);
    roundTime.value = intervals[currentRound.value % numIntervals.value].length;
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer(Number(route.params.datetime))
        .then((res: Timer) => timer.value = res)
        .then(() => {
            if (!timer.value) return;

            // get number of intervals and rounds
            numIntervals.value = timer.value.intervals.length;
            totalRounds.value = timer.value.rounds * numIntervals.value;
        })
        .then(() => {
            if (!timer.value) return;

            // initialize timer values
            currentRound.value = 0;
            ms.value = 0;
            remainingTime.value = getCurrentTime(0);
            roundTime.value = timer.value.intervals[0].length;

            // set initial colour
            timerColour.value = timer.value.intervals[0].colour;
        })
        .catch(() => router.push('/error'));
});

// update background colour when round changes
watch(currentRound, () => {
    if (!timer.value) return;

    timerColour.value = timer.value.intervals[currentRound.value % numIntervals.value].colour;
});

// set page title
watch(roundTime, () => {
    if (!timer.value) return;

    const int: Interval = timer.value.intervals[currentRound.value % numIntervals.value];

    document.title = `${int.name} - ${formatTime(roundTime.value)}`;
});
</script>

<template>
    <div 
        v-if="timer !== undefined" 
        :style="{ backgroundColor: timerColour }" 
        class="min-w-dvh min-h-dvh font-roboto font-bold text-white relative"
    >
        <div class="w-full relative">
            <RouterLink class="absolute top-3 left-3" :to="'/timer/' + timer.datetime">
                <Close class="h-12 w-12 fill-white" />
            </RouterLink>
            <div class="w-2/3 text-center text-3xl absolute top-4 left-1/2 -translate-x-1/2">
                {{ timer.name }}
            </div>
        </div>
        <div class="flex flex-col gap-11 w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div v-if="timer.intervals[currentRound % numIntervals]" class="flex place-content-center">
                <TimerProgress :seconds="roundTime" :ms="ms" :interval="timer.intervals[currentRound % numIntervals]" />
            </div>
            <div class="flex place-content-center gap-6" :style="{ fill: timerColour }">
                <button class="place-self-center p-4 bg-white rounded-full" @click="rewind">
                    <Replay class="h-8 w-8" :style="{ fill: timerColour }" />
                </button>
                <button class="p-4 bg-white rounded-full" @click="!timerStarted ? startTimer() : timerPause = !timerPause">
                    <Play class="h-12 w-12" :style="{ fill: timerColour }" v-if="!timerStarted || timerPause"  />
                    <Pause class="h-12 w-12" :style="{ fill: timerColour }" v-else />
                </button>
                <button class="place-self-center p-4 bg-white rounded-full" @click="forward">
                    <Forward class="h-8 w-8" :style="{ fill: timerColour }" />
                </button>
            </div>
        </div>
        <div class="flex w-full place-content-center text-2xl gap-2 absolute bottom-4">
            <Clock class="w-8 h-8 fill-white" />
            Time Remaining: {{ formatTime(remainingTime) }}
        </div>
    </div>
</template>