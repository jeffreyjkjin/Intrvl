<script setup lang="ts">
import Error from '../icons/error.svg'
import { ref, watch } from 'vue'

const toasts = ref<string[]>([]);

const toastTime = ref<number>(0);
const expectedTime = ref<number>(0);

// allows parent to update toasts queue
const addToast = (message: string) => {
    toasts.value.push(message);
}

defineExpose({ addToast });

// runs timer for toasts
const runToast = () => {
    // toast error expires
    if (toastTime.value >= 5600) {
        toastTime.value = 0;
        toasts.value.shift();
    }
    
    // if no toast errors are left
    if (!toasts.value.length) return;

    // adjust toast timer for drift
    const delta: number = Date.now() - expectedTime.value;
    if (delta > 10) {
        toastTime.value += 10 * Math.floor(delta / 10);
        expectedTime.value += 10 * Math.floor(delta / 10);
    }
    else {
        toastTime.value += 10;
        expectedTime.value += 10;
    }

    setTimeout(runToast, Math.max(0, 10 - delta));
}

// starts timer for toasts when a toast is added
watch(toasts.value, () => {
    // if previous toast has already started
    if (toasts.value.length > 1) return;

    toastTime.value = 0;
    expectedTime.value = Date.now() + 10;

    setTimeout(runToast, 10);
});
</script>

<template>
    <div class="w-full absolute top-4 overflow-hidden" v-if="toasts.length">
        <div 
            class="bg-red-600 font-roboto text-white text-xl px-3 py-4 rounded-2xl m-3 md:mx-auto md:w-[480px]"
            :class="{ 'newToast': toastTime <= 500, 'removeToast': toastTime >= 5000 }"
            @click="toastTime = 5000"    
        >
            <div class="flex items-center gap-2">
                <Error class="shrink-0 w-8 h-8 fill-white" />
                {{ toasts[0] }}
            </div>
        </div>
    </div>
</template>

<style>
@keyframes slideFromRight {
    from {
        transform: translateX(200%);
    }
    to {
        transform: translateX(0);
    }
}

@keyframes fadeOut {
    0% {
        opacity: 1
    }
    100% {
        opacity: 0;
    }
}

.newToast {
    animation-name: slideFromRight;
    animation-duration: 0.5s;
    animation-delay: 0s;
    animation-fill-mode: forwards;
}

.removeToast {
    animation-name: fadeOut;
    animation-duration: 0.5s;
    animation-delay: 0s;
    animation-fill-mode: forwards;    
}
</style>