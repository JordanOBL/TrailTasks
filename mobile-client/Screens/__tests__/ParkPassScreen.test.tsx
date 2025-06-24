import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import EnhancedParkPassScreen from '../ParkPassScreen';
import { TestWrapper  }from '../../__mocks__/TestWrapper';
import { testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {Q} from '@nozbe/watermelondb';

describe('ParkPassScreen', () => {
	let testUser

	beforeEach(async () =>{
	//reset local db
	   await watermelonDatabase.write(async () => {
	       await watermelonDatabase.unsafeResetDatabase();
	   })

		//bootsrap initall data from masterdb to local
		await sync(watermelonDatabase, true);

		//create testUser
    mockUser = createMockUserBase();
		testUser = await watermelonDatabase.write(async () => {
		const testUser =	await watermelonDatabase.get('users').create((user) => {
				user.id = mockUser.id;
				user.email = mockUser.email;
				user.password = mockUser.password;
				user.username = mockUser.username;
				user.trailId = mockUser.trailId; // Ensure this matches a seeded trail
				user.trailTokens = mockUser.trailTokens;
				user.lastDailyStreakDate = mockUser.lastDailyStreakDate;
				user.prestigeLevel = mockUser.prestigeLevel;
				user.pushNotificationsEnabled = mockUser.pushNotificationsEnabled;
				user.trailStartedAt = mockUser.trailStartedAt;
				user.trailProgress = mockUser.trailProgress;
				user.totalMiles = mockUser.totalMiles;
				user.dailyStreak = mockUser.dailyStreak;
				user.themePreference = mockUser.themePreference
	})

		return testUser
		})
	})
		it('renders correctly', async () => {
				const {getByTestId ,queryByTestId} = render(
				<TestWrapper testUser={testUser}>
							<EnhancedParkPassScreen user={testUser}  />
			</TestWrapper>
			)	
			await waitFor(() => {

				expect(queryByTestId('park-pass-screen')).toBeTruthy();
				expect(getByTestId('park-pass-count')).toHaveTextContent('0 / 63');
			})
	});
   it('shows correct park progression when one trail is completed in a park', async() =>{

				await watermelonDatabase.write(async () => {
					await watermelonDatabase.get('users_completed_trails').create((completedTrail) => {
						completedTrail.userId = testUser.id;
						//Beehive Loop Trail id = 1 | Park Id = 1 Acadia National Park
						completedTrail.trailId = '1'
            completedTrail.firstCompletedAt = Date.now()
				    completedTrail.lastCompletedAt = Date.now()
				    completedTrail.best_completed_time = '1:00:00'
				    completedTrail.completionCount = 1
					})
				})

				const {getByTestId ,queryByTestId} = render(
				<TestWrapper testUser={testUser}>
							<EnhancedParkPassScreen user={testUser}  />
			</TestWrapper>
			)
				//Number of trails in park_id = 1.(acadia national park)
				const parkTrailCount = await watermelonDatabase.get('trails').query(Q.where('park_id', '1')).fetchCount();

				await waitFor(() => {
					expect(queryByTestId('park-pass-screen')).toBeTruthy();
          //Should show 1 out of how evermany trails the park currently has
					expect(getByTestId('park-1-progress-text')).toHaveTextContent(`1/${parkTrailCount}`);
				})
	})
				it('shows correct park progression when multiple trails are completed in a park', async() =>{
				//add 2 completed trails in the same park	
					await watermelonDatabase.write(async () => {
					await watermelonDatabase.batch(
						 watermelonDatabase.get('users_completed_trails').prepareCreate((completedTrail) => {
							completedTrail.userId = testUser.id;
							//Beehive Loop Trail id = 1 | Park Id = 1 Acadia National Park
							completedTrail.trailId = '1'
							completedTrail.firstCompletedAt = Date.now()
							completedTrail.lastCompletedAt = Date.now()
							completedTrail.best_completed_time = '1:00:00'
							completedTrail.completionCount = 1
						}),
						 watermelonDatabase.get('users_completed_trails').prepareCreate((completedTrail) => {
								completedTrail.userId = testUser.id;
							//Jordan Pond Path Trail id = 2 | Park Id = 1 Acadia National Park
							completedTrail.trailId = '2'
							completedTrail.firstCompletedAt = Date.now()
							completedTrail.lastCompletedAt = Date.now()
							completedTrail.best_completed_time = '1:00:00'
							completedTrail.completionCount = 1

						 })
					)
				})


				const {getByTestId ,queryByTestId} = render(
				<TestWrapper testUser={testUser}>
							<EnhancedParkPassScreen user={testUser}  />
			</TestWrapper>
			)
				//Number of trails in park_id = 1.(acadia national park)
				const parkTrailCount = await watermelonDatabase.get('trails').query(Q.where('park_id', '1')).fetchCount();

				await waitFor(() => {
					expect(queryByTestId('park-pass-screen')).toBeTruthy();
					//Should show 2 out of how evermany trails the park currently has
					expect(getByTestId('park-1-progress-text')).toHaveTextContent(`2/${parkTrailCount}`);
				})
				})

				it('shows correct park progression when all trails are completed in a park and redeem button', async() =>{

								//get all trails in park_id = 1.(acadia national park)
								const trails = await watermelonDatabase.get('trails').query(Q.where('park_id', '1')).fetch();
								const preparedCreatedTrails =	trails.map((trail) =>{
												return watermelonDatabase.get('users_completed_trails').prepareCreate((completedTrail) => {
																completedTrail.userId = testUser.id;
																//Beehive Loop Trail id = 1 | Park Id = 1 Acadia National Park
																completedTrail.trailId = trail.id
																completedTrail.firstCompletedAt = Date.now()
																completedTrail.lastCompletedAt = Date.now()
																completedTrail.best_completed_time = '1:00:00'
																completedTrail.completionCount = 1
												})
								})
							


								//add all completed trails in the same park	
								await watermelonDatabase.write(async () => {
												await watermelonDatabase.batch(
																...preparedCreatedTrails	
												)
								})


								const {getByTestId ,queryByTestId} = render(
												<TestWrapper testUser={testUser}>
																<EnhancedParkPassScreen user={testUser}  />
												</TestWrapper>
								)
								await waitFor(() => {
												expect(queryByTestId('park-pass-screen')).toBeTruthy();
												//Should show 3 out of 3 trails the park currently has


												expect(queryByTestId('park-1-completed-badge')).toBeNull();
												expect(queryByTestId('park-1-incomplete-badge')).toBeDefined();
												expect(getByTestId('park-1-redeem-button')).toBeTruthy();
								})

				})
				it('shows badge after redeeming a park pass and hide redeem button', async() =>{
								//get all trails in park_id = 1.(acadia national park)
								const trails = await watermelonDatabase.get('trails').query(Q.where('park_id', '1')).fetch();
								const preparedCreatedTrails =	trails.map((trail) =>{
												return watermelonDatabase.get('users_completed_trails').prepareCreate((completedTrail) => {
																completedTrail.userId = testUser.id;
																//Beehive Loop Trail id = 1 | Park Id = 1 Acadia National Park
																completedTrail.trailId = trail.id
																completedTrail.firstCompletedAt = Date.now()
																completedTrail.lastCompletedAt = Date.now()
																completedTrail.best_completed_time = '1:00:00'
																completedTrail.completionCount = 1
												})
								})
							


								//add all completed trails in the same park	
								await watermelonDatabase.write(async () => {
												await watermelonDatabase.batch(
																...preparedCreatedTrails	
												)
								})


								const {getByTestId ,queryByTestId} = render(
												<TestWrapper testUser={testUser}>
																<EnhancedParkPassScreen user={testUser}  />
												</TestWrapper>
								)
								await waitFor(() => {
								  expect(getByTestId('park-1-redeem-button')).toBeDefined();
								})
								//press redeem button
								fireEvent.press(getByTestId('park-1-redeem-button'));

								await waitFor(() => {
												expect(getByTestId('park-1-completed-badge')).toBeDefined();
												expect(queryByTestId('park-1-incomplete-badge')).toBeNull();
												expect(queryByTestId('park-1-redeem-button')).toBeNull();
								})
				})
				it('shows prestige Button after completing all park passes have been redeemed, ie completing all trails in all parks', async() =>{
//get all trails in park_id = 1.(acadia national park)
								const parks = await watermelonDatabase.get('parks').query().fetch();
								const preparedCreatedPasses =	parks.map((park) =>{
												return watermelonDatabase.get('users_parks').prepareCreate((parkPass) => {
																parkPass.userId = testUser.id;
																parkPass.parkId = park.id
																parkPass.lastCompleted = Date.now()
																parkPass.isRewardRedeemed = true
																parkPass.parkLevel = 1

												})
								})
							


								//add all completed trails in the same park	
								await watermelonDatabase.write(async () => {
												await watermelonDatabase.batch(
																...preparedCreatedPasses	
												)
								})


								const {getByTestId ,queryByTestId} = render(
												<TestWrapper testUser={testUser}>
																<EnhancedParkPassScreen user={testUser}  />
												</TestWrapper>
								)
								await waitFor(() => {
								  expect(getByTestId('park-pass-screen')).toBeDefined();
								  expect(getByTestId('prestige-button')).toBeDefined();
								})
								
				})
      it('carryovers trail completion upon prestige', async() =>{
     const parks = await watermelonDatabase.get('parks').query().fetch();
								const preparedCreatedPasses =	parks.map((park) =>{
												return watermelonDatabase.get('users_parks').prepareCreate((parkPass) => {
																parkPass.userId = testUser.id;
																parkPass.parkId = park.id
																parkPass.lastCompleted = Date.now()
																parkPass.isRewardRedeemed = true
																parkPass.parkLevel = 1

												})
								})
//create completed trail with simulating completeing each trail twice
              const trails = await watermelonDatabase.get('trails').query(Q.where('park_id', '1')).fetch();
								const preparedCreatedTrails =	trails.map((trail) =>{
												return watermelonDatabase.get('users_completed_trails').prepareCreate((completedTrail) => {
																completedTrail.userId = testUser.id;
																//Beehive Loop Trail id = 1 | Park Id = 1 Acadia National Park
																completedTrail.trailId = trail.id
																completedTrail.firstCompletedAt = Date.now()
																completedTrail.lastCompletedAt = Date.now()
																completedTrail.best_completed_time = '1:00:00'
																completedTrail.completionCount = 2
												})
								})
							


								//add all completed trails in the same park	
								await watermelonDatabase.write(async () => {
												await watermelonDatabase.batch(
																[ ...preparedCreatedPasses, ...preparedCreatedTrails ]	
												)
								})

								const {getByTestId ,queryByTestId} = render(
												<TestWrapper testUser={testUser}>
																<EnhancedParkPassScreen user={testUser}  />
												</TestWrapper>
								)
								await waitFor(() => {
								  expect(getByTestId('park-pass-screen')).toBeDefined();
                   //shows prestige button user has all park passes redemed
								  expect(getByTestId('prestige-button')).toBeDefined();
								})
              fireEvent.press(getByTestId('prestige-button'));
               const tokens = await testUser.trailTokens;

								await waitFor(() => {
                  //pressing pretige button grants user prestige lvl x 1000, user starts with 50
                  expect(tokens).toBe(1050);
                  //shows badge for unlocking in previous prestige
									expect(getByTestId('park-1-completed-badge')).toBeDefined();
                  //shows reddem buttom from caryover trail completeion of count 2
									expect(queryByTestId('park-1-redeem-button')).toBeDefined();
                  expect(getByTestId('park-1-progress-text')).toHaveTextContent(`${trails.length}/${trails.length}`);
								})
               //pressing reddem button makes park level increase
               fireEvent.press(getByTestId('park-1-redeem-button'));
               await waitFor(() => {
                  //increased park level to 2 after redeeming from prestige
                  //only allow increasing after prestige to encourage hiking all trails for park pass rewards although trail completion will carry over.
                  expect(getByTestId('park-1-level')).toHaveTextContent(2);
									expect(getByTestId('park-2-level')).toHaveTextContent(1);																																							
               })

      })
	
});
