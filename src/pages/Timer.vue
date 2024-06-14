<script setup lang="ts">
import PlayCircle from '../icons/playcircle.svg'
import Trash from '../icons/trash.svg'
import { onBeforeMount, ref, toRaw } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import AddButton from '../components/AddButton.vue'
import IntervalAccordion from '../components/IntervalAccordion.vue'
import PageHeader from '../components/PageHeader.vue'
import { db, Interval, Timer } from '../utilities/db'
import formatTime from '../utilities/formatTime'
import getTimer from '../utilities/getTimer'
import getTotalTime from '../utilities/getTotalTime'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const timer = ref<Timer>();

const openAccordions = ref<Map<number, boolean>>(new Map<number, boolean>());

// get user input and update timer fields in db
const updateTimer = (event: Event, fieldName: string) => {
    if (!timer.value) return;
    
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    let field: any;
    
    // select field to update
    if (fieldName === 'name') {
        timer.value.name = target.value;
        field = { name: target.value }
    }
    else if (fieldName === 'rounds') {
        timer.value.rounds = Number(target.value);
        field = { rounds: Number(target.value) }
    }
    else {
        return;
    }

    // update field
    db.timers.update(
        Number(route.params.datetime),
        field
    )
        .catch((err: any) => console.error(err));
}

// deletes timer from db
const deleteTimer = () => {
    db.timers.delete(Number(route.params.datetime))
        .then(() => router.push('/'))
        .catch((err: any) => console.error(err));
}

// creates a new empty interval and adds it to intervals array of timer in db 
const createInterval = () => {
    if (!timer.value) return;

    const i: Interval = {
        name: 'New Interval',
        colour: '#3b82f6',
        length: 60,
        warning: 'None',
        warningTime: 10,
        sound: 'None',
        repeat: false,
        datetime: Date.now()
    }

    // insert interval into timer in db
    timer.value.intervals.push(i);

    db.timers.update(
        Number(route.params.datetime),
        { intervals: toRaw(timer.value.intervals) }
    )
        .catch((err: any) => console.error(err));
}

// updates order of intervals for timer
const moveInterval = () => {
    if (!timer.value) return;

    db.timers.update(
        Number(route.params.datetime),
        { intervals: timer.value.intervals.map((int: Interval) => toRaw(int)) }
    )
        .catch((err: any) => console.error(err));    
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer(Number(route.params.datetime))
        .then((res: Timer | undefined) => timer.value = res)
        .then(() => {
            if (!timer.value) return;

            // initialize openAccordion map
            timer.value.intervals.forEach((int: Interval) => {
                openAccordions.value.set(int.datetime, false);
            });
        })
        .catch(() => router.push('/error'));
});
</script>

<template>
    <PageHeader />
    <div v-if="timer !== undefined" class="font-roboto">
        <div class="flex justify-between items-center p-4">
            <div class="font-bold text-3xl">
                <input 
                    class="w-80"
                    :value="timer.name" 
                    @input="updateTimer($event, 'name')" 
                />
            </div>
            <RouterLink :to="'/start/' + route.params.datetime">
                <PlayCircle class="w-8 h-8 fill-black" />
            </RouterLink>
        </div>
        <div class="flex flex-col text-xl px-12">
            <div class="flex justify-between">
                Total Time 
                <p class="opacity-25">
                    {{ formatTime(getTotalTime(timer)) }}
                </p>
            </div>
            <div class="flex justify-between">
                Rounds 
                <input class="w-20 text-end" :value="timer.rounds" @input="updateTimer($event, 'rounds')" />
            </div>
            <div class="flex justify-between">
                Delete Timer
                <button class="" @click="deleteTimer">
                    <Trash class="w-6 h-6 fill-black" />
                </button>
            </div>
        </div>
        <div class="pb-20">
            <VueDraggable
                v-model="timer.intervals"
                :onUpdate="moveInterval"
            >
                <div class="flex flex-col" v-for="index in timer.intervals.length">
                    <IntervalAccordion :timer="timer" :index="index-1" :openAccordions="openAccordions" />
                </div>
            </VueDraggable>
        </div>
        <AddButton @click="createInterval" />
    </div>
</template>