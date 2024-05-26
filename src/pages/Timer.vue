<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router'

import PageHeader from '../components/PageHeader.vue'
import { Timer, timers } from '../db'

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
</template>