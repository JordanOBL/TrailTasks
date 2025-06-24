const formatTime = (seconds: number) => {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	const formattedTime = [];

	if (hours > 0) {
		formattedTime.push(`${hours} hr`);
	}

	if (minutes > 0) {
		formattedTime.push(`${minutes} min`);
	}

	if (remainingSeconds > 0) {
		formattedTime.push(`${remainingSeconds} sec`);
	}

	return formattedTime.join(' ');
};

export default formatTime