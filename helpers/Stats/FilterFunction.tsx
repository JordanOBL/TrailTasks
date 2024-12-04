export const FilterBy = (
	timeFilter: string,
	categoryFilter: string,
	userSessionsWithCategories: any[],
	setFilteredUserSessions: React.Dispatch<React.SetStateAction<any[]>>
) =>
{
  console.log({timeFilter, categoryFilter, userSessionsWithCategories, setFilteredUserSessions})
	// Filter userSessions based on the selected time and category filters
	let filteredSessions = userSessionsWithCategories
		.filter((session) => {
			const sessionDate = new Date(session.date_added);
			const today = new Date();
			switch (timeFilter) {
				case '1 Year':
					return (
						sessionDate >
						new Date(today.setFullYear(today.getFullYear() - 1))
					);
				case '6 Months':
					return (
						sessionDate >
						new Date(today.setMonth(today.getMonth() - 6))
					);
				case '3 Months':
					return (
						sessionDate >
						new Date(today.setMonth(today.getMonth() - 3))
					);
				case '1 Month':
					return (
						sessionDate >
						new Date(today.setMonth(today.getMonth() - 1))
					);
				case '2 Weeks':
					return (
						sessionDate >
						new Date(today.setDate(today.getDate() - 14))
					);
				case '1 Week':
					return (
						sessionDate >
						new Date(today.setDate(today.getDate() - 7))
					);
				case '1 Day':
					return (
						sessionDate.toDateString() ===
						new Date(
							today.setDate(today.getDate())
						).toDateString()
					);
				default:
					return true;
			}
		})
		.filter((session) => {
			return (
				categoryFilter === 'All Categories' ||
				session.session_category_name === categoryFilter
			);
		});
    console.log({filteredSessions})
	// Update state with the filtered sessions
	setFilteredUserSessions(filteredSessions);
};
