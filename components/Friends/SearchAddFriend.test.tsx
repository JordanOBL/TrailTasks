import {render, fireEvent, waitFor, getByTestId} from '@testing-library/react-native';
import React from 'react';
import SearchAddFriend from './SearchAddFriend';
import {TestWrapper} from '../../__mocks__/TestWrapper';
import {testDb} from '../../watermelon/testDB';
import {createUser, createMockUserBase} from '../../__mocks__/UserModel';
import {sync} from '../../watermelon/sync';
import {Pool} from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_CONNECTION_STRING });

describe('SearchAddFriend', () => {
  let testUser 
  beforeEach(async () => {
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase()
    })	
    await pool.query('TRUNCATE TABLE users CASCADE');
    await sync(testDb, true)
    testUser = await createUser(testDb, createMockUserBase()) 
  })	//Disconnect from master Db
  afterAll(async ()=>{
    await pool.end();
    await testDb.write(async () => {
      await testDb.unsafeResetDatabase();
    })

  })


  it('should render correctly', async () => {
    const {getByTestId} = render(<SearchAddFriend user={testUser} isConnected={true} />)
    await waitFor(() => {
      expect(getByTestId('friend-search-input')).toBeTruthy()
    expect(getByTestId('friend-search-button')).toBeTruthy()
    })
  })
  it('should show friend card', async () => {
  
      await pool.query('INSERT INTO users (id, username, email, password, trail_id,  trail_started_at, trail_tokens, total_miles, room_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', ['12345432efvcxs', 'testfriend','testfriend@gmail.com', testUser.password, '7', testUser.trailStartedAt, 500, '43.00','', new Date(), new Date()]);
    
    const {getByTestId} = render(<SearchAddFriend user={testUser} isConnected={true} />)
    await waitFor(() => {
      expect(getByTestId('friend-search-input')).toBeTruthy()
    })
    fireEvent.changeText(getByTestId('friend-search-input'), 'testfriend')

    fireEvent.press(getByTestId('friend-search-button'))
    await waitFor(() => {
      expect(getByTestId('12345432efvcxs-friend-card')).toBeTruthy()
    })
    


  })
})
