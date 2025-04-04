import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import ParkPassScreen from '../ParkPassScreen';
import { TestWrapper  }from '../../__mocks__/TestWrapper';
import { testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';

describe('ParkPassScreen', () => {
	let testUser

	beforeAll(async () =>{
	//reset local db
           await watermelonDatabase.write(async () => {
	       await watermelonDatabase.unsafeResetDatabase();
           })

		//bootsrap initall data from masterdb to local
		//await sync(watermelonDatabase, true);

		//create testUser
    mockUser = createMockUserBase();
		testUser = await createUser(watermelonDatabase, mockUser)
console.log(testUser)
	})
		it('renders correctly', async () => {
				const {getByTestId ,queryByTestId} = render(<TestWrapper>
				<ParkPassScreen user={testUser} completedTrails={[]} userParks={[]} />
			</TestWrapper>
			)	
			await waitFor(() => {

				expect(queryByTestId('park-pass-screen')).toBeTruthy();
				expect(getByTestId('park-pass-count')).toHaveTextContent('0 / 63');
			})




	});
});
