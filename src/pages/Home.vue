<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { Router, useRouter } from 'vue-router'

import PageHeader from '../components/PageHeader.vue'
import { db, Timer } from '../utilities/db'

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
        rounds: 0,
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
</script>

<template>
    <PageHeader />

    <div v-if="timers.length">
        <div v-for="timer in timers" :key="timer.datetime">
            <RouterLink :to="'/timer/' + timer.datetime">
                {{ timer.name }}
            </RouterLink>
        </div>
    </div>
    <div v-else>
        No timers found
    </div>

    <button @click="createTimer">
        Create New Timer
    </button>
</template>