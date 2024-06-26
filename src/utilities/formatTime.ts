// formats time to show minutes and seconds
const formatTime = (time: number): string => {
    const minutes: number = Math.floor(time / 60);
    const seconds: number = time % 60;

    // add leading zero if minutes/seconds is single digit
    const formatMin: string = `${Math.floor(Math.log10(minutes)) + 1 < 2 ? 0 : ''}${minutes}`;
    const formatSec: string = `${Math.floor(Math.log10(seconds)) + 1 < 2 ? 0 : ''}${seconds}`;

    return `${formatMin}:${formatSec}`;
}

export default formatTime;