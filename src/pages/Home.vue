<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { Router, useRouter } from 'vue-router'

import AddButton from '../components/AddButton.vue'
import PageHeader from '../components/PageHeader.vue'
import TimerCard from '../components/TimerCard.vue'
import { db, Timer } from '../utilities/db'
import getTotalTime from '../utilities/getTotalTime'

const router: Router = useRouter();
const timers = ref<Timer[]>([]);

const getAllTimers = async (): Promise<Timer[]> => {
    return db.timers.toArray();
}

const createTimer = () => {
    const datetime: number = Date.now();

    const t: Timer = {
        datetime: datetime,
        name: `New Timer`,
        rounds: 1,
        intervals: []         
    }

    // add timer to db and redirect to timer details page
    db.timers.add(t)
        .then(() => router.push(`/timer/${datetime}`))
        .catch((err: any) => console.log(err));
}

// grab all timers from db
onBeforeMount(() => {
    getAllTimers()
        .then((res: Timer[]) => timers.value = res)
        .catch((err: any) => console.error(err));
});

// set page title
onBeforeMount(() => document.title = 'Home');
</script>

<template>
    <PageHeader />
    <div class="pb-20 pt-2 font-roboto">
        <div v-if="timers.length">
            <div v-for="timer in timers" :key="timer.datetime">
                <TimerCard :timer="timer" />
            </div>
        </div>
        <div class="m-4 text-xl" v-else>
            There are currently no timers.
            <p class="text-blue-400 inline" @click="createTimer">
                Click here to create a new timer.
            </p>
        </div>
    </div>
    <AddButton @click="createTimer" />
</template>