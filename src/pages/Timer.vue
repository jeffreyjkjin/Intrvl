<script setup lang="ts">
import { onBeforeMount, ref, toRaw } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import PageHeader from '../components/PageHeader.vue'
import { Interval, Timer, timers } from '../db'

const route: RouteLocationNormalizedLoaded = useRoute();
const router: Router = useRouter();
const timer = ref<Timer>();

// gets timer with datetime param
const getTimer = async (): Promise<Timer> => {
    const t: Timer | undefined = await timers.timers.get(Number(route.params.datetime));

    if (t === undefined) {
        throw Error();
    }

    return t;
}

// get user input and update timer fields in db
const updateTimer = async (event: Event, fieldName: string) => {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    let field;
    
    // select field to update
    if (fieldName === 'name') {
        field = { name: target.value }
    }
    else if (fieldName === 'rounds') {
        field = { rounds: Number(target.value) }
    }
    else {
        return;
    }

    // update field
    await timers.timers.update(
        Number(route.params.datetime),
        field
    )
        .catch((err: any) => console.error(err));
}

// deletes timer from db
const deleteTimer = async () => {
    await timers.timers.delete(Number(route.params.datetime))
        .then(() => router.push('/'))
        .catch((err: any) => console.error(err));
}

// creates a new empty interval and adds it to intervals array of timer in db 
const createInterval = async () => {
    if (timer.value) {
        const i: Interval = {
            name: 'New Interval',
            colour: '',
            length: 60,
            warning: '',
            warningTime: 10,
            sound: '',
            repeat: false
        }

        // insert interval into timer in db
        timer.value.intervals.push(i);

        await timers.timers.update(
            Number(route.params.datetime),
            { intervals: toRaw(timer.value.intervals) }
        )
            .catch((err: any) => console.error(err));
    }
}

// updates interval field
const updateInterval = async (event: Event, fieldName: string, index: number) => {
    if (timer.value) {
        const int: Interval = timer.value.intervals[index];

        // update interval locally
        switch (fieldName) {
            case 'name':
                int.name = (event.target as HTMLTextAreaElement).value;                
                break;
            case 'colour':
                int.colour = (event.target as HTMLTextAreaElement).value;
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
        await timers.timers.update(
                Number(route.params.datetime),
                { intervals: toRaw(timer.value.intervals) }
        )
            .catch((err: any) => console.error(err));
    }
}

// deletes interval from timer
const deleteInterval = async (index: number) => {
    if (timer.value) {
        timer.value.intervals.splice(index, 1);

        // remove interval from timer in db
        await timers.timers.update(
            Number(route.params.datetime),
            { intervals: toRaw(timer.value.intervals) }
        )
            .catch((err: any) => console.error(err));
    }
}

// grab timer from db with datetime param
onBeforeMount(() => {
    getTimer()
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
        <div>
            Total Time: {{ timer.intervals.reduce<number>((sum: number, int: Interval) => {
                return sum + int.length;
            }, 0) }}
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
                    <input :value="interval.name" @input="updateInterval($event, 'name', index)" />
                </div>
                <div>
                    {{ interval.colour }}
                </div>
                <div>
                    <input :value="interval.length" @input="updateInterval($event, 'length', index)" />
                </div>
                <div>
                    Warning: <select :value="interval.sound" @input="updateInterval($event, 'sound', index)">
                        <option>Sound 1</option>
                        <option>Sound 2</option>
                        <option>Sound 3</option>
                    </select>
                </div>
                <div>
                    Warning Time: <input :value="interval.warningTime" @input="updateInterval($event, 'warningTime', index)" />
                </div>
                <div>
                    Sound: <select :value="interval.sound" @input="updateInterval($event, 'sound', index)">
                        <option>Sound 1</option>
                        <option>Sound 2</option>
                        <option>Sound 3</option>
                    </select>
                </div>
                <div>
                    Repeat: <input type="checkbox" :checked="interval.repeat" @change="updateInterval($event, 'repeat', index)" />
                </div>
                <button @click="deleteInterval(index)">
                    Delete Interval
                </button>
            </div>
        </div>
    </div>

    <button @click="createInterval">
        Add New Interval
    </button>
</template>