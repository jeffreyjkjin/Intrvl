<script setup lang="ts">
import { onBeforeMount, ref, toRaw } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'
import { VSwatches } from 'vue3-swatches'
import 'vue3-swatches/dist/style.css'

import PageHeader from '../components/PageHeader.vue'
import { db, Interval, Timer } from '../utilities/db'
import getTimer from '../utilities/getTimer'
import getTotalTime from '../utilities/getTotalTime'
import playSound from '../utilities/playSound'
import { sounds } from '../utilities/sounds'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const timer = ref<Timer>();

const swatches: string[] = [
	'#ef4444',
	'#f97316',
	'#f59e0b',
	'#eab308',
	'#84cc16',
	'#22c55e',
	'#10b981',
	'#14b8a6',
	'#06b6d4',
	'#0ea5e9',
	'#3b82f6',
	'#6366f1',
	'#8b5cf6',
	'#a855f7',
	'#d946ef',
	'#ec4899'
];

// get user input and update timer fields in db
const updateTimer = (event: Event, fieldName: string) => {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    let field: any;
    
    if (timer.value) {
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
}

// deletes timer from db
const deleteTimer = () => {
    db.timers.delete(Number(route.params.datetime))
        .then(() => router.push('/'))
        .catch((err: any) => console.error(err));
}

// creates a new empty interval and adds it to intervals array of timer in db 
const createInterval = () => {
    if (timer.value) {
        const i: Interval = {
            name: 'New Interval',
            colour: '#3b82f6',
            length: 60,
            warning: 'None',
            warningTime: 10,
            sound: 'None',
            repeat: false
        }

        // insert interval into timer in db
        timer.value.intervals.push(i);

        db.timers.update(
            Number(route.params.datetime),
            { intervals: toRaw(timer.value.intervals) }
        )
            .catch((err: any) => console.error(err));
    }
}

// updates interval field
const updateInterval = (event: Event, fieldName: string, index: number) => {
    if (timer.value) {
        const int: Interval = timer.value.intervals[index];

        // update interval locally
        switch (fieldName) {
            case 'name':
                int.name = (event.target as HTMLTextAreaElement).value;                
                break;
            case 'colour':
                int.colour = event as any;
                break;
            case 'length':
                int.length = Number((event.target as HTMLTextAreaElement).value);
                break;
            case 'warning':
                int.warning = (event.target as HTMLSelectElement).value;
                break;
            case 'warningTime':
                int.warningTime = Number((event.target as HTMLTextAreaElement).value);
                break;
            case 'sound':
                int.sound = (event.target as HTMLSelectElement).value;
                break;
            case 'repeat':
                int.repeat = (event.target as HTMLFormElement).checked;
        }

        // update interval for timer in db
        db.timers.update(
                Number(route.params.datetime),
                { intervals: toRaw(timer.value.intervals) }
        )
            .catch((err: any) => console.error(err));
    }
}

// deletes interval from timer
const deleteInterval = (index: number) => {
    if (timer.value) {
        timer.value.intervals.splice(index, 1);

        // remove interval from timer in db
        db.timers.update(
            Number(route.params.datetime),
            { intervals: toRaw(timer.value.intervals) }
        )
            .catch((err: any) => console.error(err));
    }
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer(Number(route.params.datetime))
        .then((res: Timer | undefined) => timer.value = res)
        .catch(() => router.push('/error'));
});

</script>

<template>
    <PageHeader />
    <div v-if="timer !== undefined">
        <div>
            <input :value="timer.name" @input="updateTimer($event, 'name')" />
        </div>
        <RouterLink :to="'/start/' + route.params.datetime">
            Start
        </RouterLink>
        <div>
            Total Time: {{ getTotalTime(timer) }}
        </div>
        <div>
            Rounds: <input :value="timer.rounds" @input="updateTimer($event, 'rounds')" />
        </div>
        <button @click="deleteTimer">
            Delete Timer
        </button>
        <div>
            Intervals:
            <div v-for="(interval, index) in timer.intervals">
                <div>
                    <VSwatches v-model="interval.colour" :swatches="swatches" @close="updateInterval($event, 'colour', index)" />
                    <input :value="interval.name" @input="updateInterval($event, 'name', index)" />
                </div>
                <div>
                    <input :value="interval.length" @input="updateInterval($event, 'length', index)" />
                </div>
                <div>
                    Warning: <select :value="interval.warning" @input="updateInterval($event, 'warning', index)">
                        <option v-for="sound in sounds">
                            {{ sound[0] }}
                        </option>
                    </select>
                    <button @click="playSound(interval.warning)">
                        Play
                    </button>
                </div>
                <div>
                    Warning Time: <input :value="interval.warningTime" @input="updateInterval($event, 'warningTime', index)" />
                </div>
                <div>
                    Sound: <select :value="interval.sound" @input="updateInterval($event, 'sound', index)">
                        <option v-for="sound in sounds">
                            {{ sound[0] }}
                        </option>
                    </select>
                    <button @click="playSound(interval.sound)">
                        Play
                    </button>
                </div>
                <div>
                    Repeat: <input type="checkbox" :checked="interval.repeat" @change="updateInterval($event, 'repeat', index)" />
                </div>
                <button @click="deleteInterval(index)">
                    Delete Interval
                </button>
            </div>
        </div>
        <button @click="createInterval">
            Add New Interval
        </button>
    </div>
</template>