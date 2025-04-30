import {getSessionStats} from './GetSessionStats';

describe('GetSessionStats', () => {
	it('should return correct session stats', () => {
		const sessions = [
			{
				user_session_id: 1,
				user_id: 1,
				session_category_id: 1,
				session_category_name: 'Category 1',
				session_name: 'Session 1',
				session_description: 'Session 1 description',
				total_session_time: 60,
				total_distance_hiked: 10,
				date_added: '2022-01-01T07:00:00.000Z',
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
			{
				user_session_id: 4,
				user_id: 1,
				session_category_id: 2,
				session_category_name: 'Category 2',
				session_name: 'Session 4',
				session_description: 'Session 4 description',
				total_session_time: 60,
				total_distance_hiked: 10,
				date_added: '2022-01-03T24:00:00.000Z',
			},
		];

		const stats = getSessionStats(sessions, jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn())

		expect(stats.totalTime).toBe(240);
		expect(stats.totalDistance).toBe(40);
		expect(stats.mostProductiveTimes).toEqual(['Evening']);
		expect(stats.mostUsedCategory).toBe('Category 1');
		expect(stats.leastUsedCategory).toBe('Category 2');
	});
});
