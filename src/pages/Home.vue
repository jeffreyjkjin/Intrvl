<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { Router, useRouter } from 'vue-router'

import PageHeader from '../components/PageHeader.vue'
import { Timer, timers } from '../db'

const router: Router = useRouter();
const timerArr = ref<Timer[]>([]);

const getAllTimers = async (): Promise<Timer[]> => {
    return timers.timers.toArray();
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
    timers.timers.add(t)
        .then(() => router.push(`/timer/${datetime}`))
        .catch((err: any) => console.log(err));
}

// grab all timers from db
onBeforeMount( () => {
    getAllTimers()
        .then((res: Timer[]) => timerArr.value = res)
        .catch((err: any) => console.error(err));
});
</script>

<template>
    <PageHeader />

    <div v-if="timerArr.length">
        <div v-for="timer in timerArr" :key="timer.datetime">
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