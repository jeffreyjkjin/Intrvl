import { sounds } from "../utilities/sounds"

// plays the specified sound from the sounds map; assumes sound name is valid
const playSound = (name: string) => {
    const sound: Howl = sounds.get(name) || new Howl({src: ''});
    sound.stop();
    sound.play();
}

export default playSound;