<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import { db, Interval, Timer } from '../utilities/db'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const timer = ref<Timer>();

let intervalID: number;
const totalRounds = ref<number>(0);
const remainingTime = ref<number>(0);

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
    const numInts: number = intervals.length;
    let time: number = 0;

    for (let i = 0; i < rounds; i++) {
        const int: Interval = intervals[i % numInts];

        // only count interval time if is the first round or repeat is enabled
        if (i < rounds || int.repeat) time = time + int.length;
    }

    return time;
}

// sets an interval for the timer and clears it when the timer is done
const startTimer = () => {
    remainingTime.value = getTotalTime(totalRounds.value);

    intervalID = setInterval(() => {
        if (remainingTime.value) {
            remainingTime.value = remainingTime.value - 1;
        }
        else {
            clearInterval(intervalID);
        }
    }, 1000);
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer()
        .then((res: Timer) => timer.value = res)
        .then(() => {
            // calculate number of rounds
            if (timer.value)
                totalRounds.value = timer.value.rounds * timer.value.intervals.length;
        })
        .then(() => remainingTime.value = getTotalTime(totalRounds.value))
        .catch(() => router.push('/error'));
});
</script>

<template>
    <div v-if="timer !== undefined">
        {{ timer.name }}
        <div>
            <button @click="startTimer">
                Start
            </button>
        </div>
        <div>
            Remaining Time: {{ remainingTime }}
        </div>
    </div>
</template>