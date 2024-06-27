import { Howl } from 'howler'

// map of sound names and their corresponding audio elements
export const sounds = new Map<string, Howl>([
    ['Alarm', new Howl({src: ['/sounds/alarm.wav']})],
    ['Beep', new Howl({src: ['/sounds/beep.wav']})],
    ['Bell', new Howl({src: ['/sounds/bell.wav']})],
    ['Bicycle Bell', new Howl({src: ['/sounds/bicycle-bell.wav']})],
    ['Buzzer', new Howl({src: ['/sounds/buzzer.wav']})],
    ['Cuckoo', new Howl({src: ['/sounds/cuckoo.wav']})],
    ['Ding', new Howl({src: ['/sounds/ding.wav']})],
    ['Double Ding', new Howl({src: ['/sounds/ding-ding.wav']})],
    ['Mario Coin', new Howl({src: ['/sounds/mario-coin.wav']})],
    ['Ring Tone', new Howl({src: ['/sounds/ringtone.wav']})],
    ['School Bell', new Howl({src: ['/sounds/school-bell.wav']})],
    ['Sonic Ring', new Howl({src: ['/sounds/sonic-ring.wav']})],
    ['Tap', new Howl({src: ['/sounds/tap.wav']})],
    ['Triple Bell', new Howl({src: ['/sounds/triple-bell.wav']})],
    ['Triple Tap', new Howl({src: ['/sounds/triple-tap.wav']})],
    ['Whistle', new Howl({src: ['/sounds/whistle.wav']})],
    ['None', new Howl({src: ['']})]
]);