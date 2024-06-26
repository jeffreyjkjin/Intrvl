<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { Router, useRouter } from 'vue-router'

import AddButton from '../components/AddButton.vue'
import ErrorToast from '../components/ErrorToast.vue'
import PageHeader from '../components/PageHeader.vue'
import TimerCard from '../components/TimerCard.vue'
import { db, Timer } from '../utilities/db'

const router: Router = useRouter();
const timers = ref<Timer[]>([]);

const toast = ref<any>(null);

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
        .catch(() => (toast.value as any).addToast('A new timer could not be created.'));
}

// grab all timers from db
onBeforeMount(() => {
    getAllTimers()
        .then((res: Timer[]) => timers.value = res)
        .catch(() => (toast.value as any).addToast('The saved timers could not be loaded.'));
});

// set page title
onBeforeMount(() => document.title = 'Home');
</script>

<template>
    <ErrorToast ref="toast" />
    <PageHeader />
    <div class="pb-20 pt-2 font-roboto">
        <div v-if="timers.length">
            <div v-for="timer in timers" :key="timer.datetime">
                <TimerCard :timer="timer" />
            </div>
        </div>
        <div class="text-xl m-4 md:mx-auto md:w-[720px] md:text-center" v-else>
            There are currently no timers.
            <a class="text-blue-400 inline" href="#create-timer" @click="createTimer">
                Click here to create a new timer.
            </a>
        </div>
    </div>
    <AddButton @click="createTimer" />
</template>