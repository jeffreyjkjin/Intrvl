<script setup lang="ts">
import CircleProgress from "vue3-circle-progress"

import { Interval } from '../utilities/db'
import formatTime from '../utilities/formatTime'

defineProps<{
    seconds: number,
    ms: number,
    interval: Interval | undefined
}>();

</script>

<template>
    <div v-if="interval !== undefined" class="w-min relative">
            <CircleProgress
                :size="360" 
                :border-width="8"
                :border-bg-width="8"
                fill-color="#FFFFFF"
                empty-color="#5978716C"
                :percent="((seconds * 1000) - ms) / (interval.length * 10)"
                linecap="square"
                :transition="0"
            >
            </CircleProgress>
            <div class="flex flex-col place-items-center text-white font-bold absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div class="text-8xl">
                    {{ formatTime(seconds) }}
                </div>
                <div class="text-2xl">
                    {{ interval.name }}
                </div>
            </div>
    </div>
</template>