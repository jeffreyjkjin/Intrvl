<script setup lang="ts">
import CheckBoxBlank from '../icons/checkboxblank.svg'
import CheckBoxChecked from '../icons/checkboxchecked.svg'
import ChevronDown from '../icons/chevrondown.svg'
import ChevronUp from '../icons/chevronup.svg'
import Drag from '../icons/drag.svg'
import Sound from '../icons/sound.svg'
import Trash from '../icons/trash.svg'
import { ref, toRaw } from 'vue'
import { Collapse } from 'vue-collapsed'
import { VSwatches } from 'vue3-swatches'
import 'vue3-swatches/dist/style.css'

import ErrorToast from '../components/ErrorToast.vue'
import { db, Interval, Timer } from '../utilities/db'
import formatTime from '../utilities/formatTime'
import playSound from '../utilities/playSound'
import { sounds } from '../utilities/sounds'

const props = defineProps<{
    timer: Timer,
    index: number,
    openAccordions: Map<number, boolean>
}>();

// colours for interval
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

const toast = ref<any>(null);

// updates interval field
const updateInterval = (event: Event, fieldName: string, index: number) => {
    const int: Interval = props.timer.intervals[index];

    // update interval locally
    switch (fieldName) {
        case 'name':
            const name: string = (event.target as HTMLTextAreaElement).value;

            // check if name is too long
            if (name.length > 128) {
                int.name = name.slice(0, 128);
                (toast.value as any).addToast('The name of an interval cannot be longer than 128 characters.');
            }
            else {
                int.name = name;
            }
            break;
        case 'colour':
            int.colour = event as any;
            break;
        case 'length':
            if (!/^\d*(:\d*)?$/g.test((event.target as HTMLTextAreaElement).value)) {
                // invalid input
                int.length = 1;
                
                (toast.value as any).addToast('The provided length for the interval is invalid.');
            }
            else if ((event.target as HTMLTextAreaElement).value.includes(':')) {
                // minutes and seconds
                let time: number = 0;
                time += Number((event.target as HTMLTextAreaElement).value.match(/.*?(?=:)/)) * 60;
                time += Number((event.target as HTMLTextAreaElement).value.match(/(?<=:).*/));
                
                int.length = time ? time : 1;
                
                if (!time) (toast.value as any).addToast('The length for the interval cannot be zero.');
            }
            else {
                // only seconds
                const time: number = Number((event.target as HTMLTextAreaElement).value);
                int.length = time ? time : 1;

                if (!time) (toast.value as any).addToast('The length for the interval cannot be zero.');
            }
            break;
        case 'warning':
            int.warning = toRaw((event.target as HTMLSelectElement).value);
            break;
        case 'warningTime':
            if (!/^\d*(:\d*)?$/g.test((event.target as HTMLTextAreaElement).value)) {
                // invalid input
                int.warningTime = 0;

                (toast.value as any).addToast('The provided time for the warning is invalid.');
            }
            else if ((event.target as HTMLTextAreaElement).value.includes(':')) {
                // minutes and seconds
                let time: number = 0;
                time += Number((event.target as HTMLTextAreaElement).value.match(/.*?(?=:)/)) * 60;
                time += Number((event.target as HTMLTextAreaElement).value.match(/(?<=:).*/));

                int.warningTime = time;
            }
            else {
                // only seconds
                int.warningTime = Number((event.target as HTMLTextAreaElement).value);
            }
            break;
        case 'sound':
            int.sound = toRaw((event.target as HTMLSelectElement).value);
            break;
        case 'repeat':
            int.repeat = !int.repeat;
    }

    // update interval for timer in db
    db.timers.update(
        Number(props.timer.datetime),
        { intervals: props.timer.intervals.map((int: Interval) => toRaw(int)) }
    )
        .catch(() => (toast.value as any).addToast('This interval could not be updated.'));
}

// deletes interval from timer
const deleteInterval = (index: number) => {
    props.timer.intervals.splice(index, 1);

    // remove interval from timer in db
    db.timers.update(
        Number(props.timer.datetime),
        { intervals: toRaw(props.timer.intervals) }
    )
        .catch(() => (toast.value as any).addToast('This interval could not be deleted.'));
}

// inverts openAccordion entry for the current interval 
const toggleAccordion = () => {
    const int: Interval = props.timer.intervals[props.index];

    props.openAccordions.set(int.datetime, !props.openAccordions.get(int.datetime) || false);
}
</script>

<template>
    <ErrorToast ref="toast" />
    <div class="font-roboto bg-stone-100 m-4 rounded-2xl">
        <div class="flex px-3 py-4 justify-between">
            <div class="flex items-center gap-1">
                <Drag class="w-6 h-6 fill-black" />
                <VSwatches
                    class="mt-[6.4px]"
                    v-model="props.timer.intervals[index].colour" 
                    :swatches="swatches" 
                    :trigger-style="{ width: '20px', height: '20px', borderRadius: '24%' }"
                    swatch-size="20"
                    @close="updateInterval($event, 'colour', index)"
                />
                <input 
                    class="font-bold text-xl bg-stone-100 w-40 ml-2" 
                    :value="props.timer.intervals[index].name" 
                    @input="updateInterval($event, 'name', index)" 
                />
            </div>
            <div class="flex items-center gap-1">
                <input 
                    class="bg-stone-100 text-xl text-right w-20" 
                    :value="formatTime(props.timer.intervals[index].length)" 
                    @change="updateInterval($event, 'length', index)" 
                />
                <button class="opacity-40" @click="toggleAccordion">
                    <ChevronDown 
                        class="w-6 h-6 fill-black" 
                        v-if="!openAccordions.get(timer.intervals[index].datetime)" 
                    />
                    <ChevronUp class="w-6 h-6 fill-black" v-else />
                </button>
            </div>
        </div>
        <Collapse :when="openAccordions.get(timer.intervals[index].datetime) || false">
            <div class="flex flex-col gap-5 text-xl px-10 pb-6">
                <div class="flex justify-between items-center">
                    Warning
                    <div class="flex items-center gap-3">
                        <select 
                            class="bg-stone-100" 
                            :value="props.timer.intervals[index].warning" 
                            @input="updateInterval($event, 'warning', index)"
                        >
                            <option class="bg-stone-100" v-for="sound in sounds">
                                {{ sound[0] }}
                            </option>
                        </select>
                        <button @click="playSound(props.timer.intervals[index].warning)">
                            <Sound class="w-6 h-6 fill-black" />
                        </button>
                    </div> 
                </div>
                <div class="flex justify-between items-center">
                    Warning Time 
                    <input 
                        class="w-20 text-right bg-stone-100"
                        :value="formatTime(props.timer.intervals[index].warningTime)" 
                        @change="updateInterval($event, 'warningTime', index)" 
                    />
                </div>
                <div class="flex justify-between items-center">
                    Sound
                    <div class="flex items-center gap-3">
                        <select 
                            class="bg-stone-100"
                            :value="props.timer.intervals[index].sound" 
                            @input="updateInterval($event, 'sound', index)"
                        >
                            <option class="bg-stone-100" v-for="sound in sounds">
                                {{ sound[0] }}
                            </option>
                        </select>
                        <button @click="playSound(props.timer.intervals[index].sound)">
                            <Sound class="w-6 h-6 fill-black" />
                        </button>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    Repeat
                    <button @click="updateInterval($event, 'repeat', index)">
                        <CheckBoxBlank class="w-6 h-6 fill-black" v-if="!props.timer.intervals[index].repeat" />
                        <CheckBoxChecked class="w-6 h-6 fill-black" v-else />
                    </button>
                </div>
                <div class="flex justify-between items-center">
                    Delete Interval
                    <button @click="deleteInterval(index)">
                        <Trash class="w-6 h-6 fill-black" />
                    </button>
                </div>
            </div>
        </Collapse> 
    </div>
</template>