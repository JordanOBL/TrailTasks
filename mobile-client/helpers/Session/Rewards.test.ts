import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { WrappedApp} from '../../index';
import {testDb as watermelonDatabase} from '../../watermelon/testDB';
import {createMockUserBase, createUser} from '../../__mocks__/UserModel';
import Rewards from './Rewards';

describe('Rewards', ()=> {
let testUser
  // Reset the local database
  beforeAll(async () => {
    await watermelonDatabase.write(async () => {
      await watermelonDatabase.unsafeResetDatabase();
    })
 
    // Create a mock user
    const mockUser = createMockUserBase()
    testUser = await createUser(watermelonDatabase, mockUser)
    
  })

  it('gives user correct tokens 10 tokens for 15 minutes', async () => {
    const setSessionDetails = jest.fn()
    const sessionDetails = {
    startTime: null,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    breakTimeReduction:0,
    minimumPace: 2,
    maximumPace: 5.5,
    paceIncreaseValue: .25,
    paceIncreaseInterval: 900, //15 minutes,
    increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
    completedHike: false,
    strikes: 0,
    penaltyValue: 1,
    continueSessionModal: false,
    totalDistanceHiked: 0.0,
    totalTokenBonus: 0,
    trailTokensEarned:0,
    sessionTokensEarned:0,
    isLoading: false,
    isError: false,
    backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
    }

    const timer = {
      startTime: null,
      isCompleted: false,
      time: 1500,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      focusTime: 150,
      shortBreakTime: 300,
      longBreakTime: 2700,
      sets: 3,
      completedSets: 0,
      pace: 2,
      autoContinue: false,
      elapsedTime: 900 //15 minutes
    }

  //calculate rewards
  const result = await Rewards.calculateSessionTokens({ sessionDetails, timer, setSessionDetails })
  expect(result).toBe(10)
  })
  it('gives user correct tokens 20 tokens for 30 minutes', async () => {
    const setSessionDetails = jest.fn()
    const sessionDetails = {
    startTime: null,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    breakTimeReduction:0,
    minimumPace: 2,
    maximumPace: 5.5,
    paceIncreaseValue: .25,
    paceIncreaseInterval: 900, //15 minutes,
    increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
    completedHike: false,
    strikes: 0,
    penaltyValue: 1,
    continueSessionModal: false,
    totalDistanceHiked: 0.0,
    totalTokenBonus: 0,
    trailTokensEarned:0,
    sessionTokensEarned:0,
    isLoading: false,
    isError: false,
    backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
    }

    const timer = {
      startTime: null,
      isCompleted: false,
      time: 1500,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      focusTime: 150,
      shortBreakTime: 300,
      longBreakTime: 2700,
      sets: 3,
      completedSets: 0,
      pace: 2,
      autoContinue: false,
      elapsedTime: 1800 //30 minutes
    }

  //calculate rewards
  const result = await Rewards.calculateSessionTokens({ sessionDetails, timer, setSessionDetails })
  expect(result).toBe(20)
  })
it('gives user correct tokens for 45 minute session', async () => {
    //+10% for every 45 minutes, includding 10 for every 15 minutes
    const setSessionDetails = jest.fn()
    const sessionDetails = {
    startTime: null,
    sessionName: '',
    sessionDescription: '',
    sessionCategoryId: null,
    breakTimeReduction:0,
    minimumPace: 2,
    maximumPace: 5.5,
    paceIncreaseValue: .25,
    paceIncreaseInterval: 900, //15 minutes,
    increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
    completedHike: false,
    strikes: 0,
    penaltyValue: 1,
    continueSessionModal: false,
    totalDistanceHiked: 0.0,
    totalTokenBonus: 0,
    trailTokensEarned:0,
    sessionTokensEarned:0,
    isLoading: false,
    isError: false,
    backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
    }

    const timer = {
      startTime: null,
      isCompleted: false,
      time: 1500,
      isRunning: false,
      isPaused: false,
      isBreak: false,
      focusTime: 150,
      shortBreakTime: 300,
      longBreakTime: 2700,
      sets: 3,
      completedSets: 0,
      pace: 2,
      autoContinue: false,
      elapsedTime: 2700 //45 minutes
    }

  //calculate rewards
  const result = await Rewards.calculateSessionTokens({ sessionDetails, timer, setSessionDetails })
  expect(result).toBe(33)
  })



})
