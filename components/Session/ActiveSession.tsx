import {
	Achievement,
	User_Completed_Trail,
	User_Queued_Trail,
	Trail,
	User,
	User_Session,
} from '../../watermelon/models';
import {
	updateSession,
	endSession,
	pauseSession,
	resumeSession,
	shortBreak,
	skipBreak,
} from '../../helpers/Timer/timerFlow';
import {
	AppState,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import ContinueSessionModal from './ContinueSessionModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActiveSessionBackpack from './ActiveSessionBackpack';
import { achievementManagerInstance } from '../../helpers/Achievements/AchievementManager';
import { AchievementsWithCompletion } from '../../types/achievements';
import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import { SessionDetails } from '../../types/session';
import formatTime from '../../helpers/formatTime';
import { useDatabase } from '@nozbe/watermelondb/react';
import {withObservables} from '@nozbe/watermelondb/react';
import SessionTimer from '../Timer/SessionTimer';
import NextHundredthMileSeconds from '../../helpers/Timer/nextHundredthMileSeconds';
import QuitSessionModal from './QuitSessionModal';
import Rewards from '../../helpers/Session/Rewards';
import handleError from '../../helpers/ErrorHandler';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native'; // You can choose any icon set like FontAwesome, MaterialIcons, etc.

interface Props {
	sessionDetails: SessionDetails;
	setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
	timer: Timer;
	setTimer: React.Dispatch<React.SetStateAction<Timer>>;
	userSession: User_Session;
	user: User;
	currentTrail: Trail;
	queuedTrails: User_Queued_Trail[];
	completedTrails: User_Completed_Trail[];
	achievementsWithCompletion: AchievementsWithCompletion[];
	currentSessionCategory: string;
	showResultsScreen: boolean;
	endSession: () => void;
}

const ActiveSession = ({
	setSessionDetails,
	sessionDetails,
	timer,
	setTimer,
	userSession,
	user,
	currentTrail,
	queuedTrails,
	completedTrails,
	achievementsWithCompletion,
	currentSessionCategory,
	endSession,
	showResultsScreen,
}: Props) => {
	const watermelonDatabase = useDatabase();
	const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
	const [appState, setAppState] = useState(AppState.currentState);
	const [showQuitSessionModal, setShowQuitSessionModal] = useState(false);
	const [sessionCompletedTrails, setSessionCompletedTrails] = useState<User_Completed_Trail[]>([]);
	const onAchievementEarned = useCallback(
		(achievements: Achievement[]) => {
			setEarnedAchievements((prevAchievements) => [
				...prevAchievements,
				...achievements,
			]);
		},
		[]
	);

	const addCompletedTrail = ({ trail }: { trail: Trail }) => {
		setSessionCompletedTrails((prevSessionCompletedTrails) => [...prevSessionCompletedTrails, trail]);
	};

	const onCompletedTrail = useCallback(
		({ setSessionDetails, trail, reward }: { setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>; trail: Trail; reward: number }) => {
			addCompletedTrail({ trail });
			Rewards.completedTrail({ setSessionDetails, reward });
		},
		[]
	);

	const sessionUpdateFrequency = useMemo(() => NextHundredthMileSeconds(timer.pace), [timer.pace]);

	const canIncreaseDistance = useMemo(() => {
		const notJustStarted = timer.time < timer.focusTime;
		return notJustStarted && timer.startTime !== null && !timer.isPaused && !timer.isBreak;
	}, [timer.time, timer.startTime, timer.isPaused, timer.isBreak]);

	useEffect(() => {
		let intervalId: NodeJS.Timeout | null = null;

		if (canIncreaseDistance) {
			intervalId = setInterval(() => {
				updateSession({
					watermelonDatabase,
					user,
					userSession,
					completedTrails,
					queuedTrails,
					currentTrail,
					setSessionDetails,
					sessionDetails,
					timer,
					setTimer,
					achievementsWithCompletion,
					onAchievementEarned,
					onCompletedTrail,
				});
			}, sessionUpdateFrequency * 1000);
		}

		return () => {
			if (intervalId !== null) {clearInterval(intervalId);}
		};
	}, [canIncreaseDistance, sessionUpdateFrequency]);

	const checkUserSessionAchievements = async () => {
		const results = await achievementManagerInstance.checkUserSessionAchievements(
			user,
			sessionDetails,
			currentSessionCategory,
			achievementsWithCompletion
		);
		if (results) {onAchievementEarned(results);}
	};

	useEffect(() => {
		if (user && sessionDetails && currentSessionCategory && achievementsWithCompletion) {
			checkUserSessionAchievements();
		}
	}, [achievementsWithCompletion]);

	async function handleShowQuitSessionModal() {
		await pauseSession(timer, setTimer, sessionDetails, setSessionDetails)

		await Rewards.calculateSessionTokens({setSessionDetails,sessionDetails, timer})
		setShowQuitSessionModal(true)
	}

	async function handleContinueSession(){
		await resumeSession(setTimer)
		setShowQuitSessionModal(false)
	}



	const onAddSession = async () => {
		try {
			const sessionTokenReward = await Rewards.calculateSessionTokens({
				setSessionDetails,
				sessionDetails,
				timer,
			});

			setSessionDetails((prev) => ({
				...prev,
				totalSessionTokens: sessionTokenReward,
			}));

			setTimer((prev: { focusTime: any; sets: number; }) => ({
				...prev,
				time: prev.focusTime,
				sets: prev.sets + 3,
				isBreak: false,
				isCompleted: false,
			}));
		} catch (err) {
			handleError(err, 'onAddSession');
		}
	};

	const onAddSet = async () => {
		try {
			const sessionTokenReward = await Rewards.calculateSessionTokens({
				setSessionDetails,
				sessionDetails,
				timer,
			});

			setSessionDetails((prev) => ({
				...prev,
				totalSessionTokens: sessionTokenReward,
			}));

			setTimer((prev: { focusTime: any; sets: number; }) => ({
				...prev,
				time: prev.focusTime,
				sets: prev.sets + 1,
				isBreak: false,
				isCompleted: false,
			}));
		} catch (err) {
			handleError(err, 'onAddSet');
		}
	};

	useEffect(() => {
		let endSessionTimeout: NodeJS.Timeout | null = null;

		if (timer.isCompleted) {
			endSessionTimeout = setTimeout(() => {
				if (timer.autoContinue) {
					onAddSession();
				} else {
					endSession();
				}
			}, 60000); // 1 minute for modal countdown
		}

		return () => {
			if (endSessionTimeout !== null) {clearTimeout(endSessionTimeout);}
		};
	}, [timer.isCompleted]);

	async function updateSessionTokens() {
		console.debug('useEffect: updataing sessionTokens');
		const sessionTokenRewards = await Rewards.calculateSessionTokens({ timer, sessionDetails, setSessionDetails });
		console.debug('DONE updating session tokens sessionTokenRewards',sessionTokenRewards);
	}

	useEffect(() => {
		updateSessionTokens();
	}, [timer.isBreak, timer.isCompleted]);

	useEffect(() => {
		const handleAppStateChange = (nextAppState: string | ((prevState: 'active' | 'background' | 'inactive' | 'unknown' | 'extension') => 'active' | 'background' | 'inactive' | 'unknown' | 'extension')) => {
			if(timer.isRunning){
				if (appState.match(/active/) && nextAppState?.match(/inactive|background/)) {
					console.log('App is in the background or inactive.');
					pauseSession(timer, setTimer, sessionDetails, setSessionDetails);
				} else if (nextAppState === 'active' && appState.match(/inactive|background/)) {
					console.log('App is back in the foreground.');

					resumeSession(setTimer)
				}
				// @ts-ignore
				setAppState(nextAppState);
			}
		};

		const subscription = AppState.addEventListener('change', handleAppStateChange);
		return () => subscription.remove();
	}, [appState, timer]);

	useFocusEffect(
		React.useCallback(() => {
			// Screen is focused
			console.log('Timer screen is focused.');
			console.log('timer usefocuseffect', timer);
			if(timer.isRunning){
				resumeSession(setTimer)
			}
			return () => {
				// Screen is unfocused
				console.log('Timer screen is unfocused.');
				if(timer.isRunning){
					pauseSession(timer, setTimer, sessionDetails, setSessionDetails);
				}
			};
		}, [timer.isRunning])
	);


	return (
		<SafeAreaView style={styles.container} testID="active-session-screen">
			<ScrollView style={{ paddingBottom: 80 }}>
				<QuitSessionModal
					isVisible={showQuitSessionModal}
					showResultsScreen={showResultsScreen}
					continueSession={handleContinueSession}
					sessionDetails={sessionDetails}
					/>
				<ContinueSessionModal
					isVisible={timer.isCompleted}
					showResultsScreen={showResultsScreen}
					onAddSession={onAddSession}
					onAddSet={onAddSet}
					focusTime={timer.focusTime}
					endSession={endSession}
				/>

				<SessionTimer
					timer={timer}
					setTimer={setTimer}
					minimumPace={sessionDetails.minimumPace}
					maximumPace={sessionDetails.maximumPace}
					paceIncreaseInterval={sessionDetails.paceIncreaseInterval}
					paceIncreaseValue={sessionDetails.paceIncreaseValue}
				/>
				<View style={styles.buttonsContainer}>
					{/* Stop Button */}
					<Pressable onPress={handleShowQuitSessionModal} testID="stop-button" style={[styles.button, styles.endSessionButton]}>
						<Icon name="square" size={28} color="white" />
					</Pressable>

					{/* Pause/Resume Button (conditionally rendered icon) */}
					<Pressable
						testID="pause-resume-button"
						onPress={() =>
							timer.isPaused
								? resumeSession(setTimer)
								: pauseSession(timer, setTimer, sessionDetails, setSessionDetails)
						}
						style={[styles.button, styles.pauseResumeButton]}
					>
						<Icon
							name={timer.isPaused ? 'play' : 'pause'}
							size={28}
							color="white"
						/>
					</Pressable>
					{/* Skip Break Button (conditionally rendered) */}
					{timer.isBreak && (
						<Pressable testID="skip-break-button" onPress={() => skipBreak({ timer, setTimer })} style={[styles.button, styles.skipBreakButton]}>
							<Icon name="play-skip-forward" size={28} color="white" />
						</Pressable>
					)}
				</View>
				<View style={styles.trailNameContainer}>
					<Text style={styles.trailName} testID="current-trail-name">{currentTrail.trailName}</Text>
					<EnhancedDistanceProgressBar
						timer={timer}
						sessionDetails={sessionDetails}
						user={user}
						trail={currentTrail}
					/>
				</View>
				<ActiveSessionBackpack sessionDetails={sessionDetails} user={user} />
				<View style={styles.statsContainer}>
					<View style={styles.statsGrid}>
						<StatBox label="Pace" value={`${timer.pace} mph`} />
						<StatBox label="Sets" value={`${timer.completedSets} / ${timer.sets}`} />
						<StatBox  label="Strikes" value={sessionDetails.strikes} />
						<StatBox label="Reward" value={sessionDetails.trailTokensEarned + sessionDetails.sessionTokensEarned} />
						<StatBox  label="Achievements" value={earnedAchievements.length} />
						<StatBox  label="Trails" value={sessionCompletedTrails.length} />
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

const StatBox = ({ label, value }) => (
	<View style={styles.infoBox}>
		<Text style={styles.infoLabel}>{label}</Text>
		<Text testID={label.toLowerCase()} style={styles.infoValue}>{value}</Text>
	</View>
);

const ActionButton = ({ onPress, label, buttonStyle }) => (
	<Pressable onPress={onPress} style={[styles.button, buttonStyle]}>
		<Text style={styles.buttonText}>{label}</Text>
	</Pressable>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'black',
		padding: 20,
	},
	trailNameContainer: {
		marginBottom: 10,
		alignItems: 'center',
		padding: 10,
		borderRadius: 10,
	},
	trailName: {
		color: 'white',
		fontSize: 20,
		fontWeight: 'bold',
		marginVertical: 10,
	},
	statsContainer: {
		backgroundColor: 'rgba(255,255,255,.1)',
		padding: 15,
		borderRadius: 15,
		marginBottom: 20,
	},
	statsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	infoBox: {
		width: '30%',
		marginBottom: 20,
		alignItems: 'center',
	},
	infoLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#aaa',
		marginBottom: 5,
	},
	infoValue: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#ffffff',
	},
	buttonsContainer: {
		display: 'flex',
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	button: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: 'center',
	},
	buttonText: {
		color: 'white',
	},
	endSessionButton: {
		backgroundColor: 'transparent',
	},
	skipBreakButton: {
		backgroundColor: 'transparent',
	},
	pauseResumeButton: {
		backgroundColor: 'transparent',
	},
});

const enhance = withObservables(['user', 'currentTrail', 'completedTrails', 'queuedTrails', 'userSession', 'usersAchievements'], ({ user, userSession }) => ({
	user: user.observe(),
	currentTrail: user.trail.observe(),
	completedTrails: user.usersCompletedTrails.observe(),
	queuedTrails: user.usersQueuedTrails.observe(),
	userSession,
	userAchievements: user.usersAchievements.observe(),
}));

const EnhancedActiveSession = enhance(ActiveSession);
export default EnhancedActiveSession;
