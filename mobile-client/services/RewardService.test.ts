import { User, User_Wild } from '../watermelon/models'
import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { createMockUserBase, createUser } from '../__mocks__/UserModel'

import { EventBus } from '../EventBus/EventBus'
import RewardService from './RewardService'
import { SessionSnapshot } from '../sessionEngine/sessionEngine'
import { testDb } from '../watermelon/testDB'
import {waitFor} from '@testing-library/react-native'

describe('RewardService', () => {
    let bus : EventBus | undefined = undefined;
    let rewardService: RewardService | undefined = undefined;
    let user: User | undefined = undefined;
    let snapshot: SessionSnapshot | undefined = undefined
    
    beforeAll(async () => { 
        bus = EventBus.getInstance();
        user  = await createUser(testDb, createMockUserBase())

        rewardService = new RewardService(bus, testDb,user , false)

        snapshot = {
            sessionId: '123',
            userId: user.id,
            sessionName: 'Rewards Service Test',
            sessionCategory: ['1', 'Chores'],
            phase: 'COMPLETED',
            totalElapsedSec: 4500,
            elapsedInPhaseSec: 900,
            distanceNeeded: 0,
            currentSet: 3,
            completedSets: 3,
            totalSets: 3,
            currentPaceMph: 2.5,
            totalDistanceMiles: 1.00,
            focusTimeSec: 1500,
            shortBreakSec: 300,
            longBreakSec: 900,
            autoContinue: false,
            currentStrikes:0,
            completedTrails: [],
            isPaused: false,
            tokenBonusFlat: 0,
            tokenBonusPercent: 1,
            startedAt: 123456789
        }

        if(!user){
            throw Error ('No User')
        } 
        if(!bus){
            throw Error("N0 Bus")
        }
        if(!snapshot){
            throw Error("No snapshot")
        }
    })

    afterAll(() => {
        bus?.clear()
        testDb.write(() => testDb.unsafeResetDatabase())
    })
    
    test('calculateWildXp returns the correct wild xp (10 * totalSessionDistance)', async () => {  
        const expected = 10;
        const dbSpy = jest.spyOn(user?.usersWilds, 'extend').mockReturnValue(true)
        const result = await (rewardService as any).calculateActiveWildXpReward(snapshot)
         await waitFor(() =>{
            expect(result).toEqual(expected)
         })
    })

    test('calculateTrailTokens returns 0 trail tokens if 0 trail completed', () => {
        const expected = 0;
        const result = (rewardService as any).calculateTrailTokens(snapshot)
        expect(result).toEqual(expected)
    })
    
    test('calculateTrailTokens returns minimum of 5 for short trails', () => {
        const expected = 5;
        const result = (rewardService as any).calculateTrailTokens({ completedTrails: [{id: '1', distance: 1.00}]})
        expect(result).toEqual(expected)
    })
    test('calculateTrailTokens returns correct tokens for multiple completed trails', () => {
        const expected = 35;
        const result = (rewardService as any).calculateTrailTokens({ completedTrails: [{id: '1', distance: 1.00}, {id: '1', distance: 10.00}]})
        expect(result).toEqual(expected)
    })
    test('calculatedRewards returns correct tokens with tokenFlatBonus', () => {

        const expected = 45;
        const result = (rewardService as any).calculateTrailTokens({ completedTrails: [{id: '1', distance: 1.00}, {id: '1', distance: 10.00}], tokenBonusFlat: 10})
        expect(result).toEqual(expected)
    })
    test('calculatedRewards returns correct tokens with tokenBonusPercent applied (from addon or wild perk)', () => {
        const expected = 48;
        const result = (rewardService as any).calculateTrailTokens({ completedTrails: [{id: '1', distance: 1.00}, {id: '1', distance: 10.00}], tokenBonusFlat: 10, tokenBonusPercent: 5})
        expect(result).toEqual(expected)
    })
})