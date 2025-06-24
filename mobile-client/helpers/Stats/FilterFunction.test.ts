import {FilterBy} from './FilterFunction';
describe('FilterBy', () => {
	const sessions = [
		//today
			{
				user_session_id: 1,
				user_id: 1,
				session_category_id: 1,
				session_category_name: 'Category 1',
				session_name: 'Session 1',
				session_description: 'Session 1 description',
				total_session_time: 60,
				total_distance_hiked: 10,
				date_added: new Date().toISOString(),
			},
			{
				user_session_id: 2,
				user_id: 1,
				session_category_id: 1,
				session_category_name: 'Category 1',
				session_name: 'Session 2',
				session_description: 'Session 2 description',
				total_session_time: 60,
				total_distance_hiked: 10,
				date_added: '2022-01-02T15:00:00.000Z',
			},
		//Month
			{
				user_session_id: 3,
				user_id: 1,
				session_category_id: 2,
				session_category_name: 'Category 2',
				session_name: 'Session 3',
				session_description: 'Session 3 description',
				total_session_time: 60,
				total_distance_hiked: 10,
				date_added: '2022-01-03T24:00:00.000Z',
			},
		//Year
			{
				user_session_id: 4,
				user_id: 1,
				session_category_id: 2,
				session_category_name: 'Category 2',
				session_name: 'Session 4',
				session_description: 'Session 4 description',
				total_session_time: 60,
				total_distance_hiked: 10,
				date_added: '2025-01-03T24:00:00.000Z',
			},
		];

	it('should filter sessions by category', () => {
		const filteredSessions = FilterBy('All Time','All Categories',sessions,jest.fn());
		expect(filteredSessions.length).toBe(4);
	});

	it('should filter sessions by year', () => {
		const filteredSessions = FilterBy('1 Year','All Categories',sessions,jest.fn());
		expect(filteredSessions.length).toBe(2);
	});

	it('should filter sessions by month', () => {
		const filteredSessions = FilterBy('1 Day','All Categories',sessions,jest.fn());
		expect(filteredSessions.length).toBe(1);
	});

})

