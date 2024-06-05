import { sounds } from "../utilities/sounds"

// plays the specified sound from the sounds map; assumes sound name is valid
const playSound = (name: string) => {
    const sound: HTMLAudioElement = sounds.get(name) as HTMLAudioElement;
    sound.currentTime = 0;
    sound.play();
}

export default playSound;