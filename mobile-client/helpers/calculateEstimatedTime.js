function calculateEstimatedTime(distance) {
    const pace = 2; // miles per hour
    const timeInHours = distance / pace;
    const totalMinutes = Math.round(timeInHours * 60);

    if (totalMinutes < 60) {
        return `${totalMinutes} min.`;
    } else {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return minutes > 0 ? `${hours} hr ${minutes} min.` : `${hours} hr`;
    }
}
export default calculateEstimatedTime;