import SessionList from './SessionList';
import { TestWrapper } from '../../__mocks__/TestWrapper';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {Q} from '@nozbe/watermelondb';
import {render} from '@testing-library/react-native';
	const sessions = [
		//today
			{
				id: 1,
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
				id: 2,
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
				id: 3,
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
				id: 4,
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


describe('SessionList', () => {

  test('it correctly shows session list and renders correctly', async () => {
    const {getByTestId} = render(
      <SessionList 
        filteredUserSessions={sessions}
      /> 	
    )

    expect(getByTestId('session-list-item-1')).toBeTruthy();
    expect(getByTestId('session-list-item-2')).toBeTruthy();
    expect(getByTestId('session-list-item-3')).toBeTruthy();
    expect(getByTestId('session-list-item-4')).toBeTruthy();

  })
})
