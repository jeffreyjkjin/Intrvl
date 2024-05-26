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

// creates a new empty interval and adds it to intervals array of timer in db 
const createInterval = async () => {
    if (timer.value) {
        const i: Interval = {
            name: 'New Interval',
            colour: '',
            length: 0,
            warning: '',
            warningTime: 0,
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
            {{ timer.name}}
        </div>
        <div>
            Total Time:
        </div>
        <div>
            Rounds: {{ timer.rounds }}
        </div>
        <div>
            Intervals:
            <div v-for="interval in timer.intervals">
                <div>
                    {{ interval.name }}
                </div>
                <div>
                    {{ interval.colour }}
                </div>
                <div>
                    {{ interval.length }}
                </div>
                <div>
                    {{ interval.warning }}
                </div>
                <div>
                    {{ interval.warningTime }}
                </div>
                <div>
                    {{ interval.sound }}
                </div>
                <div>
                    {{ interval.repeat }}
                </div>
            </div>
        </div>
    </div>

    <button @click="createInterval">
        Add New Interval
    </button>
</template>