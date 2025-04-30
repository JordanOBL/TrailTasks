import Stats from './Stats';
import { TestWrapper } from '../../__mocks__/TestWrapper';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {Q} from '@nozbe/watermelondb';
import {render} from '@testing-library/react-native';

describe('Stats', () => {
	const mockUser = createMockUserBase();
	let testUser
	const sessions = [
		//today
			{
				id: 1,
				user_id: 1,
				session_category_id: 1,
				session_category_name: 'Category 1',
				session_name: 'Session 1',
				session_description: 'Session 1 description',
				total_session_time: 3600,
				total_distance_hiked: 10,
				date_added: new Date().toISOString(),
			},
			{
				id: 2,
				user_id: 1,
				session_category_id: 1,
				session_category_name: 'Category 1',
				session_name: 'Session 2',
				session_description: 'Session 2 description',
				total_session_time: 3600,
				total_distance_hiked: 10,
				date_added: '2022-01-02T15:00:00.000Z',
			},
		//Month
			{
				id: 3,
				user_id: 1,
				session_category_id: 2,
				session_category_name: 'Category 2',
				session_name: 'Session 3',
				session_description: 'Session 3 description',
				total_session_time: 3600,
				total_distance_hiked: 10,
				date_added: '2022-01-03T24:00:00.000Z',
			},
		//Year
			{
				id: 4,
				user_id: 1,
				session_category_id: 2,
				session_category_name: 'Category 2',
				session_name: 'Session 4',
				session_description: 'Session 4 description',
				total_session_time: 3600,
				total_distance_hiked: 10,
    date_added: '2025-01-03T24:00:00.000Z',
  },
];


	test('it renders correctly', async () => {
		const {getByTestId} = render(
			<TestWrapper testUser={testUser}>
				<Stats
          filteredUserSessions={sessions}
          sessionCategories={[]}
          filteredTime="All Time"
          filteredCategory="All Categories"
				/>
			</TestWrapper>
		)
		expect(getByTestId('stats-container')).toBeTruthy();
	})	
	test('it correctly shows users users total miles', async () => {
  	
    const {getByTestId} = render(
      <TestWrapper testUser={testUser}>
        <Stats
          filteredUserSessions={sessions}
          sessionCategories={[]}
          filteredTime="All Time"
          filteredCategory="All Categories"
        />
      </TestWrapper>
    )
    expect(getByTestId('total-distance')).toHaveTextContent('40.00 miles')
    expect(getByTestId('total-focus-time')).toHaveTextContent('4 hr');
    expect(getByTestId('most-used-category')).toHaveTextContent('Category 1');
    expect(getByTestId('most-productive-time')).toHaveTextContent('Evening');

  })
  test('it filters by categories', async () => {
    
    const {getByTestId} = render(
      <TestWrapper testUser={testUser}>
        <Stats
          filteredUserSessions={sessions.filter(session => session.session_category_name === 'Category 1')}
          sessionCategories={[]}
          filteredTime="All Time"
          filteredCategory="Category 1"
        />
      </TestWrapper>
    )
    expect(getByTestId('stats-container')).toBeTruthy();
    expect(getByTestId('total-distance')).toHaveTextContent('20.00 miles')
    expect(getByTestId('total-focus-time')).toHaveTextContent('2 hr');


  })
})
