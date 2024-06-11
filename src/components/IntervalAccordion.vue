<script setup lang="ts">
import { toRaw } from 'vue'
import { VSwatches } from 'vue3-swatches'
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
            int.repeat = (event.target as HTMLFormElement).checked;
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
    <div>
        <div>
            <VSwatches 
                v-model="props.timer.intervals[index].colour" 
                :swatches="swatches" @close="updateInterval($event, 'colour', index)" 
            />
            <input :value="props.timer.intervals[index].name" @input="updateInterval($event, 'name', index)" />
        </div>
        <div>
            <input :value="props.timer.intervals[index].length" @input="updateInterval($event, 'length', index)" />
        </div>
        <div>
            Warning: <select :value="props.timer.intervals[index].warning" @input="updateInterval($event, 'warning', index)">
                <option v-for="sound in sounds">
                    {{ sound[0] }}
                </option>
            </select>
            <button @click="playSound(props.timer.intervals[index].warning)">
                Play
            </button>
        </div>
        <div>
            Warning Time: <input :value="props.timer.intervals[index].warningTime" @input="updateInterval($event, 'warningTime', index)" />
        </div>
        <div>
            Sound: <select :value="props.timer.intervals[index].sound" @input="updateInterval($event, 'sound', index)">
                <option v-for="sound in sounds">
                    {{ sound[0] }}
                </option>
            </select>
            <button @click="playSound(props.timer.intervals[index].sound)">
                Play
            </button>
        </div>
        <div>
            Repeat: <input type="checkbox" :checked="props.timer.intervals[index].repeat" @change="updateInterval($event, 'repeat', index)" />
        </div>
        <button @click="deleteInterval(index)">
            Delete Interval
        </button>
    </div>
</template>