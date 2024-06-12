<script setup lang="ts">
import CheckBoxBlank from '../icons/checkboxblank.svg'
import CheckBoxChecked from '../icons/checkboxchecked.svg'
import ChevronDown from '../icons/chevrondown.svg'
import ChevronUp from '../icons/chevronup.svg'
import Drag from '../icons/drag.svg'
import Sound from '../icons/sound.svg'
import Trash from '../icons/trash.svg'
import { toRaw } from 'vue'
import { VSwatches } from 'vue3-swatches'
// import VSwatches from '../swatches/VSwatches.vue'
import 'vue3-swatches/dist/style.css'

import { db, Interval, Timer } from '../utilities/db'
import playSound from '../utilities/playSound'
import { sounds } from '../utilities/sounds'

const props = defineProps<{
    timer: Timer,
    index: number
}>();

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

// updates interval field
const updateInterval = (event: Event, fieldName: string, index: number) => {
    const int: Interval = props.timer.intervals[index];

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
            int.repeat = !props.timer.intervals[index].repeat;
    }

    // update interval for timer in db
    db.timers.update(
            Number(props.timer.datetime),
            { intervals: toRaw(props.timer.intervals) }
    )
        .catch((err: any) => console.error(err));
}

// deletes interval from timer
const deleteInterval = (index: number) => {
    props.timer.intervals.splice(index, 1);

    // remove interval from timer in db
    db.timers.update(
        Number(props.timer.datetime),
        { intervals: toRaw(props.timer.intervals) }
    )
        .catch((err: any) => console.error(err));
}
</script>

<template>
    <div class="font-roboto bg-stone-100 m-4 rounded-2xl">
        <div class="flex px-3 py-4 justify-between">
            <div class="flex items-center gap-1">
                <Drag class="w-6 h-6 fill-black" />
                <VSwatches
                    class="mt-[6.4px]"
                    v-model="props.timer.intervals[index].colour" 
                    :swatches="swatches" @close="updateInterval($event, 'colour', index)"
                    :trigger-style="{ width: '20px', height: '20px', borderRadius: '24%' }"
                    swatch-size="20"
                />
                <input 
                    class="font-bold text-xl bg-stone-100 w-40" 
                    :value="props.timer.intervals[index].name" 
                    @input="updateInterval($event, 'name', index)" 
                />
            </div>
            <div class="flex items-center gap-1">
                <input 
                    class="bg-stone-100 text-xl text-right w-20" 
                    :value="props.timer.intervals[index].length" 
                    @input="updateInterval($event, 'length', index)" 
                />
                <button class="opacity-40">
                    <ChevronDown class="w-6 h-6 fill-black" />
                    <!-- <ChevronUp class="w-6 h-6 fill-black" /> -->
                </button>
            </div>
        </div>
        <div class="flex flex-col gap-5 text-xl px-10 pb-6">
            <div class="flex justify-between items-center">
                Warning
                <div class="flex items-center gap-3">
                    <select :value="props.timer.intervals[index].warning" @input="updateInterval($event, 'warning', index)">
                        <option v-for="sound in sounds">
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
                    :value="props.timer.intervals[index].warningTime" 
                    @input="updateInterval($event, 'warningTime', index)" 
                />
            </div>
            <div class="flex justify-between items-center">
                Sound
                <div class="flex items-center gap-3">
                    <select :value="props.timer.intervals[index].sound" @input="updateInterval($event, 'sound', index)">
                        <option v-for="sound in sounds">
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
    </div>
</template>