import  {speedModifier} from "../../helpers/Timer/timerFlow";

describe("Speed modifier", () => {
	it("increase Pace", async () => {
		// Mock setSessionDetails (cb)
		const mockSetSessionDetails = jest.fn();
		let sessionDetails = {
			isSessionStarted: false,
			isPaused: false,
			sessionName: '',
			sessionDescription: '',
			sessionCategoryId: null,
			initialPomodoroTime: 1500,
			initialShortBreakTime: 300,
			initialLongBreakTime: 2700,
			elapsedPomodoroTime: 1800,
			elapsedShortBreakTime: 0,
			elapsedLongBreakTime: 0,
			breakTimeReduction:0,
			sets: 3,
			currentSet: 2,
			minimumPace: 2.5,
			maximumPace: 5.5,
			pace: 2,
			paceIncreaseValue: .25,
			paceIncreaseInterval: 900, //15 minutes,
			increasePaceOnBreakValue: 0, //TODO: possible addon sleeping bag increases pace by this interval on breaks
			completedHike: false,
			strikes: 0,
			penaltyValue: 1,
			endSessionModal: false,
			totalSessionTime: 0,
			totalDistanceHiked: 0.0,
			trailTokenBonus: 0,
			trailTokensEarned:0,
			isLoading: false,
			isError: false,
			backpack: [{addon: null, minimumTotalMiles:0.0}, {addon: null, minimumTotalMiles:75.0}, {addon: null, minimumTotalMiles:175.0}, {addon: null, minimumTotalMiles:375.0}]
		}
		// Call the function
		speedModifier(mockSetSessionDetails, sessionDetails);

		// Check that setSessionDetails was called with the correct update
		expect(mockSetSessionDetails).toHaveBeenCalledWith(expect.any(Function));

		// Simulate the state update callback
		const stateUpdateCallback = mockSetSessionDetails.mock.calls[0][0];
		const newState = stateUpdateCallback(sessionDetails);
		expect(newState.pace).toBe(2.75); // 2 + 0.5
	})
});
