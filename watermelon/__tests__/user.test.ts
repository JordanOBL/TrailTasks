import {User, Trail} from '../models'
import {testDb} from '../testDB'
import {sync} from '../sync'
import {createMockUserBase, createUser} from '../../__mocks__/UserModel'
import {Q} from '@nozbe/watermelondb'

const mockUser = createMockUserBase()

describe('users writers', () => {
  beforeEach(async()=>{
      await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
      })
    //test server needs to be running (trailTasksServer -> npm run test-server)
    await sync(testDb, true)
    //create user
    await createUser(testDb, mockUser)
  })
  //purchaseTrail(trail: Trail, cost: Number)
  test('purchaseTrail()', async () => { 
    //trail amount
    const trailCost = 10

    const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
    const[  trail ]:Trail = await testDb.get('trails').query(Q.where('id', '1')).fetch()
    
    //get users purchased trails
    let purchasedTrails = await user.usersPurchasedTrails

    //expect users purchased trails to be 0
    expect(purchasedTrails).toHaveLength(0)

    //call test function
    await user.purchaseTrail(trail, trailCost)

    //get updated usersPurchasedTrails
    purchasedTrails = await user.usersPurchasedTrails
    //expect user purchase trail to be length 1

    expect(purchasedTrails).toHaveLength(1)
    expect(purchasedTrails[0].trailId).toBe('1')
    expect(user.trailTokens).toBe(40)
  })

  test('increaseDailyStreak()', async() => {
    
    const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
    const oldDailyStreakDate = user.lastDailyStreakDate;
    const oldTokenAmount = user.trailTokens;
    const oldDailyStreak = user.dailyStreak;
  
    await user.increaseDailyStreak()
    expect(user.dailyStreak).toEqual(oldDailyStreak + 1)
    expect(user.trailTokens).toBeGreaterThan(oldTokenAmount)
    
  })

  test('buyAddon()', async () => {
    //get 1st addon from sync
    const [addonToBuy] = await testDb.get('addons').query(Q.where('id', '1')).fetch()
    //get user from localDB
    const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
    const oldTrailTokens = user.trailTokens
//user should have no addons
    let usersAddons = await user.usersAddons;
    expect(usersAddons).toHaveLength(0)
    //call testing function
    await user.buyAddon(addonToBuy)

    //get updated usersAddons
    usersAddons = await user.usersAddons
    //test new addon bought
    expect(usersAddons).toHaveLength(1)
    expect(usersAddons[0].addonId).toBe('1')
    expect(usersAddons[0].quantity).toBe(1)
    expect(user.trailTokens).toBe(oldTrailTokens - addonToBuy.price)

    //test buying the same addon increaases quantity
    await user.buyAddon(addonToBuy)
    usersAddons = await user.usersAddons
    expect(usersAddons[0].quantity).toBe(2)
    expect(user.trailTokens).toBe(oldTrailTokens - addonToBuy.price * 2)

    //test buying different addon
    const [addonToBuy2] = await testDb.get('addons').query(Q.where('id', '2')).fetch()
    await user.buyAddon(addonToBuy2)
    usersAddons = await user.usersAddons

    expect(usersAddons).toHaveLength(2)
    expect(usersAddons[1].addonId).toBe('2')
    expect(usersAddons[1].quantity).toBe(1)
    expect(user.trailTokens).toBe(oldTrailTokens - (addonToBuy2.price + addonToBuy.price * 2))


  })
})
