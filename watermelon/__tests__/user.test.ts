import {User, Trail} from '../models'
import {testDb} from '../testDB'
import {sync} from '../sync'
import {createMockUserBase, createUser} from '../../__mocks__/UserModel'
import {Q} from '@nozbe/watermelondb'
import {SessionDetails} from '../../types/session'

const mockUser = createMockUserBase()

describe('users writers', () => {
  describe('purchaseTrail()',  () => {
    beforeAll(async()=>{
      await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
      })
      //test server needs to be running (trailTasksServer -> npm run test-server)
      await sync(testDb, true)
      //create user
      await createUser(testDb, mockUser)
    })

    //purchaseTrail(trail: Trail, cost: Number)
    test('succesfully purchases and adds trail to userspurchased trails', async () => { 
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
  })
  describe('increaseDailyStreak()',  () => {
    beforeAll(async()=>{
      await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
      })
      //test server needs to be running (trailTasksServer -> npm run test-server)
      await sync(testDb, true)
      //create user
      await createUser(testDb, mockUser)
    })

    test('succesfully increases daily streak and grants tokens', async() => {

      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      const oldDailyStreakDate = user.lastDailyStreakDate;
      const oldTokenAmount = user.trailTokens;
      const oldDailyStreak = user.dailyStreak;

      await user.increaseDailyStreak()
      expect(user.dailyStreak).toEqual(oldDailyStreak + 1)
      expect(user.trailTokens).toBeGreaterThan(oldTokenAmount)

    })
  })
  describe('buyAddon()',  () => {
    beforeAll(async()=>{
      await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
      })
      //test server needs to be running (trailTasksServer -> npm run test-server)
      await sync(testDb, true)
      //create user
      await createUser(testDb, mockUser)
    })

    test('succesfully purchases and adds addon to usersAddons()', async () => {
      //get 1st addon from sync
      const [addonToBuy] = await testDb.get('addons').query(Q.where('id', '1')).fetch()
      //get user from localDB
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      const oldTrailTokens = user.trailTokens
      //user should have no addons
      let usersAddons = await user.usersAddons;
      expect(usersAddons).toHaveLength(0)
      //call testing function
      let successMessage = await user.buyAddon(addonToBuy)

      //get updated usersAddons
      usersAddons = await user.usersAddons
      //test new addon bought

      expect(successMessage).toBe(`You purchased ${addonToBuy.name}`)
      expect(usersAddons).toHaveLength(1)
      expect(usersAddons[0].addonId).toBe('1')
      expect(usersAddons[0].quantity).toBe(1)
      expect(user.trailTokens).toBe(oldTrailTokens - addonToBuy.price)
    })
    test('increases quantity of previously purchased addon', async () => {
      //get user from localDB
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      const [alreadyPurchasedAddon] = await user.usersAddons
       const [addonToBuy] = await testDb.get('addons').query(Q.where('id', alreadyPurchasedAddon.addonId)).fetch()
      const oldTrailTokens = user.trailTokens
      await user.buyAddon(addonToBuy)
      usersAddons = await user.usersAddons
      expect(usersAddons[0].quantity).toBe(2)
      expect(user.trailTokens).toBeLessThan(oldTrailTokens)
    })

    test('throws error if user has doesnt have enough miles', async () => {
      // 2  | Hiking Poles II   | Reduces the interval for pace increases, allowing the user to get a pace increase faster. |     2 |    50 | HikingPoles2.png  |                   50 | pace_increase_interval |          600 | 2025-01-29 22:01:41.214-05 | 2025-01-29 22:01:41.214-05
      const [addonToBuy] = await testDb.get('addons').query(Q.where('id', '2')).fetch()
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      //set trail tokens to 0
      await testDb.write(async () => {
        await user.update((user) => {
        user.totalMiles = 0
        user.trailTokens = 100
      })
      })

      //try to purchase an addon
      expect(user.buyAddon(addonToBuy)).rejects.toThrowError(`You must have at least ${addonToBuy.requiredTotalMiles} miles to purchase ${addonToBuy.name}`)
    })


    test('throws error if user has insufficient tokens', async () => {
      const [addonToBuy] = await testDb.get('addons').query(Q.where('id', '1')).fetch()
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      //set trail tokens to 0
      await testDb.write(async () => {
        await user.update((user) => {
        user.totalMiles = 0
        user.trailTokens = 0
      })
      })

      //try to purchase an addon
      await expect(user.buyAddon(addonToBuy)).rejects.toThrowError(`You must have at least ${addonToBuy.price} tokens to purchase ${addonToBuy.name}`)
    })

  })

  describe('prepareConsumeUserAddons()', () => {

    beforeEach(async()=>{
      await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
      })
      //test server needs to be running (trailTasksServer -> npm run test-server)
      await sync(testDb, true)
      //create user
      await createUser(testDb, mockUser)
    })


    test('succesfully subtracts userAddon quantity > 1', async () => {
      let usersAddons;
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      const [addonToBuy] = await testDb.get('addons').query(Q.where('id', '1')).fetch()
      //buy addon x2
      await user.buyAddon(addonToBuy)
      await user.buyAddon(addonToBuy)
      usersAddons = await user.usersAddons
      expect(usersAddons[0].quantity).toBe(2)
      //consume addon in session
      await testDb.write(async () => {
      const preparedTransaction =  user.prepareConsumeUserAddons(usersAddons[0])
        testDb.batch(preparedTransaction )
      })
      usersAddons = await user.usersAddons
      expect(usersAddons[0].quantity).toBe(1)    
    })
    test('succesfully deletes userAddon quantity = 1', async () => {
      let usersAddons;
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      const [addonToBuy] = await testDb.get('addons').query(Q.where('id', '1')).fetch() 
      await user.buyAddon(addonToBuy)
      usersAddons = await user.usersAddons
      console.log('usersAddons', usersAddons)
      expect(usersAddons[0].quantity).toBe(1)
      //consume addon in session
      await testDb.write(async () => {
      const preparedTransaction =  user.prepareConsumeUserAddons(usersAddons[0])
       await testDb.batch(preparedTransaction)
      })
      usersAddons = await user.usersAddons
      expect(usersAddons).toHaveLength(0)    

      
    })

  })
  describe('startNewSession()', () => {
    beforeAll(async()=>{
      await testDb.write(async () => {
        await testDb.unsafeResetDatabase();
      })
      //test server needs to be running (trailTasksServer -> npm run test-server)
      await sync(testDb, true)
      //create user
      await createUser(testDb, mockUser)
    })

    test('succesfully creates new session', async () => {
    const [addonToBuy]:Addon = await testDb.get('addons').query(Q.where('id', '1')).fetch()
      
      const [ user  ]:User = await testDb.get('users').query( Q.where('email', 'mockemail@example.com')).fetch()
      await user.buyAddon(addonToBuy)
    const mockSessionDetails:SessionDetails = {
    startTime: new Date().toISOString(),
    sessionName: 'mockSessionName',
    sessionDescription: 'mockSessionDescription',
    sessionCategoryId: '1',
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
    backpack: [{addon: addonToBuy, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
  }
     
const { newSession, status } = await user.startNewSession(mockSessionDetails)

console.log('status', status)
console.log('new created session', newSession)

expect(status).toBeTruthy()
expect(newSession.id).toBeTruthy()

// Compare it to the record from the DB
const [session] = await user.usersSessions
expect(session.id).toEqual(newSession.id)
      const usersAddons = await user.usersAddons
      expect(usersAddons).toHaveLength(0)
    })
  })

  
})

