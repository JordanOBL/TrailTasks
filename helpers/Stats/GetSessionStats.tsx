import { User_Session } from "../../watermelon/models";

interface Session {
	date_added: string;
	session_category_id: number;
	session_category_name: string;
	session_description: string | null;
	session_name: string;
	total_distance_hiked: number;
	total_session_time: number;
	user_id: number;
	user_session_id: number;
}

interface SessionStats {
	totalTime: number;
	totalDistance: number;
	//mostProductiveTime: string;
	mostUsedCategory: string;
	leastUsedCategory: string;
	mostProductiveTimes: string[];
}

export const getSessionStats = (
	filteredUserSessions:User_Session[],
	setTotalTime: React.Dispatch<React.SetStateAction<number>>,
	setTotalDistance: React.Dispatch<React.SetStateAction<number>>,
	setMostProductiveTimes: React.Dispatch<React.SetStateAction<string[]>>,
	setMostUsedCategory: React.Dispatch<React.SetStateAction<string>>,
	setLeastUsedCategory: React.Dispatch<React.SetStateAction<string>>,
	filterCategoryState?: string[]
): SessionStats => {
	// // Filter sessions by category if necessary
	// const filteredUserSessions = filterCategoryState.includes('All Categories')
	// 	? sessions
	// 	: sessions.filter((session) =>
	// 			filterCategoryState.includes(session.session_category_name)
	// 	  );

	// Calculate total time and distance
	const totalTime = filteredUserSessions.reduce(
		(acc, session) => acc + session.total_session_time,
		0
	);
	const totalDistance = filteredUserSessions.reduce(
		(acc, session) => acc + parseFloat(session.total_distance_hiked),
		0
	);

	// Calculate most productive time of day
	const productiveTimes = filteredUserSessions.map((session) => {
		const date = new Date(session.date_added);
		const hour = date.getHours();
		const timeOfDay =
			hour >= 5 && hour < 12
				? 'Morning'
				: hour >= 12 && hour < 18
				? 'Afternoon'
				: 'Evening';
		return timeOfDay;
	});

	const timeOfDayCount = productiveTimes.reduce((acc, timeOfDay) => {
		acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
		return acc;
	}, {} as { [key: string]: number });

	const mostProductiveTime = Object.keys(timeOfDayCount).reduce((a, b) =>
		 {return timeOfDayCount[a] > timeOfDayCount[b] ? a : b}, 0
	);

	// Calculate most used category and least used category
	const categoryCounts = filteredUserSessions.reduce((acc, session) => {
		acc[session.session_category_name] =
      (acc[session.session_category_name] || 0) + 1;
		return acc;
	}, {} as { [key: string]: number });

	const categoriesSortedByCount = Object.keys(categoryCounts).sort(
		(a, b) => categoryCounts[b] - categoryCounts[a]
	);
	const mostUsedCategory = categoriesSortedByCount[0];
	const leastUsedCategory =
		categoriesSortedByCount[categoriesSortedByCount.length - 1];

	// Calculate most productive times
	const productiveTimesCount = productiveTimes.reduce((acc, timeOfDay) => {
		acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
		console.log(acc)
		return acc;
		
	}, {} as { [key: string]: number });

	const productiveTimesSortedByCount = Object.keys(productiveTimesCount).sort(
		(a, b) => productiveTimesCount[b] - productiveTimesCount[a]
	);
	const mostProductiveTimes = productiveTimesSortedByCount.filter(
		(timeOfDay) =>
			productiveTimesCount[timeOfDay] ===
			productiveTimesCount[productiveTimesSortedByCount[0]]
	);

	setTotalDistance(totalDistance);
  setTotalTime(totalTime);
  setMostUsedCategory(mostUsedCategory)
  setMostProductiveTimes(mostProductiveTimes)
  setLeastUsedCategory(leastUsedCategory)
	return {
		totalTime,
		totalDistance,
		//mostProductiveTime,
		mostUsedCategory,
		leastUsedCategory,
		mostProductiveTimes,
	};
};
