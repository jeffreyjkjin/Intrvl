<script setup lang="ts">
import ChevronRight from '../icons/chevronright.svg'
import { onBeforeMount, ref } from 'vue'

import { Interval, Timer } from '../utilities/db'
import formatTime from '../utilities/formatTime'
import getTotalTime from '../utilities/getTotalTime'

const timerColour = ref<string>('');

const props = defineProps<{
    timer: Timer
}>();

onBeforeMount(() => {
    // find the longest interval in the timer and use its colour for accent 
    const longestInt: Interval = props.timer.intervals.reduce<Interval>((longest: Interval, current: Interval) => {
        const longestTime = longest.length * (longest.repeat ? props.timer.rounds : 1);
        const currentTime = current.length * (current.repeat ? props.timer.rounds : 1);

        return currentTime > longestTime ? current : longest;
    }, props.timer.intervals[0]);

    timerColour.value = longestInt ? longestInt.colour : '#3b82f6';
})
</script>

<template>
    <div class="flex justify-between text-xl relative font-roboto bg-stone-100 m-4 px-3 py-4 rounded-2xl">
        <div class="absolute w-6 h-full left-0 top-1/2 -translate-y-1/2 rounded-l-2xl" :style="{ backgroundColor: timerColour }">
            &nbsp
        </div>
        <div class="font-bold ml-6">
            {{ timer.name }}
        </div>
        <div class="flex gap-1 opacity-40 items-center">
            {{ formatTime(getTotalTime(timer)) }}
            <RouterLink :to="'/timer/' + timer.datetime">
                <ChevronRight class="w-6 h-6 fill-black" />
            </RouterLink>
        </div>
    </div>
</template>