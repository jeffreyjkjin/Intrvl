<script setup lang="ts">
import PlayCircle from '../icons/playcircle.svg'
import Trash from '../icons/trash.svg'
import { onBeforeMount, ref, toRaw } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import AddButton from '../components/AddButton.vue'
import ErrorToast from '../components/ErrorToast.vue'
import IntervalAccordion from '../components/IntervalAccordion.vue'
import PageHeader from '../components/PageHeader.vue'
import { db, Interval, Timer } from '../utilities/db'
import formatTime from '../utilities/formatTime'
import getTimer from '../utilities/getTimer'
import getTotalTime from '../utilities/getTotalTime'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const timer = ref<Timer>();

const toast = ref<any>(null);

const openAccordions = ref<Map<number, boolean>>(new Map<number, boolean>());

// get user input and update timer fields in db
const updateTimer = (event: Event, fieldName: string) => {
    if (!timer.value) return;
    
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    let field: any;
    
    // select field to update
    if (fieldName === 'name') {
        let name: string = target.value;
        
        // if name is too long
        if (name.length > 128) {
            name = name.slice(0, 128);
            (toast.value as any).addToast('The name of the timer cannot be longer than 128 characters.');
        }

        timer.value.name = name;
        field = { name: name }
    }
    else if (fieldName === 'rounds') {
        const num: number = Number(target.value);

        if (Number.isNaN(num)) {
            // if round number is invalid
            (toast.value as any).addToast('The provided number of rounds is not a valid number.');
        }
        else if (!num) {
            // if rounds is zero
            (toast.value as any).addToast('The provided number of rounds is cannot be zero.');
        }
        else if (num < 0) {
            // if rounds is negative
            (toast.value as any).addToast('The provided number of rounds is cannot be negative.');
        }

        timer.value.rounds = !Number.isNaN(num) && num > 0 ? num : 1;
        field = { rounds: !Number.isNaN(num) && num > 0 ? num : 1 }
    }
    else {
        return;
    }

    // update field
    db.timers.update(
        Number(route.params.datetime),
        field
    )
        .then(() => {
            if (!timer.value) return;

            document.title = `Timer - ${timer.value.name}`;
        })
        .catch(() => (toast.value as any).addToast('This timer could not be updated.'));
}

// deletes timer from db
const deleteTimer = () => {
    db.timers.delete(Number(route.params.datetime))
        .then(() => router.push('/home'))
        .catch(() => (toast.value as any).addToast('This timer could not be deleted.'));
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
        .catch(() => (toast.value as any).addToast('A new interval could not be added to this timer.'));
}

// updates order of intervals for timer
const moveInterval = () => {
    if (!timer.value) return;

    db.timers.update(
        Number(route.params.datetime),
        { intervals: timer.value.intervals.map((int: Interval) => toRaw(int)) }
    )
        .catch(() => (toast.value as any).addToast('This interval could not be moved.'));    
}

// sends user to timer start page
const startTimer = () => {
    if (!timer.value) return;

    if (timer.value.intervals.length) router.push(`/start/${timer.value.datetime}`);
    else (toast.value as any).addToast('Cannot start a timer with no intervals.')
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

            document.title = `Timer - ${timer.value.name}`;
        })
        .catch(() => router.push('/error'));
});
</script>

<template>
    <ErrorToast ref="toast" />
    <PageHeader />
    <div v-if="timer !== undefined" class="font-roboto">
        <div class="flex justify-between items-center p-4 md:px-0 md:mx-auto md:w-[720px]">
            <div class="font-bold text-3xl">
                <input 
                    class="w-80"
                    :value="timer.name" 
                    @change="updateTimer($event, 'name')" 
                />
            </div>
            <button @click="startTimer">
                <PlayCircle class="w-8 h-8 fill-black" />
            </button>
        </div>
        <div class="flex flex-col text-xl gap-3 px-12 md:px-0 md:mx-auto md:w-[720px]">
            <div class="flex justify-between">
                Total Time 
                <p class="opacity-25">
                    {{ formatTime(getTotalTime(timer)) }}
                </p>
            </div>
            <div class="flex justify-between">
                Rounds 
                <input class="w-20 text-end" :value="timer.rounds" @change="updateTimer($event, 'rounds')" />
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
                v-if="timer.intervals.length"
                v-model="timer.intervals"
                :onUpdate="moveInterval"
            >
                <div class="flex flex-col" v-for="index in timer.intervals.length">
                    <IntervalAccordion :timer="timer" :index="index-1" :openAccordions="openAccordions" />
                </div>
            </VueDraggable>
            <div class="text-xl text-justify m-4 md:mx-auto md:w-[720px]" v-else>
                This timer currently does not have any intervals.
                <div class="text-blue-400 inline" @click="createInterval">
                    Click here to create a new interval.
                </div>
            </div>
        </div>
        <AddButton @click="createInterval" />
    </div>
</template>