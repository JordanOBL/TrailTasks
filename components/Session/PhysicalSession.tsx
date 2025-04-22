
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import BackgroundGeolocation, {
  Location,
  Subscription
} from "react-native-background-geolocation";
import PhysicalSessionTimer from '../Timer/PhysicalSessionTimer';

import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import {withObservables} from '@nozbe/watermelondb/react';
const PhysicalSession = ({user,currentTrail,completedTrails, queuedTrails, userSession, userAchievements, timer, setTimer, sessionDetails, setSessionDetails, showResultsScreen,endSession , achievementsWithCompletion , debug=false }) => {
/// State.
  const [events, setEvents] = React.useState<any[]>([]);
  const [enabled, setEnabled] = React.useState(false);
  const [location, setLocation] = React.useState('');
	const [sessionCompletedTrails, setSessionCompletedTrails] = useState<User_Completed_Trail[]>([]);
	const [showQuitSessionModal, setShowQuitSessionModal] = useState(false);
	const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
	  // Keep a list of BackgroundGeolocation event-subscriptions so we can later remove them
  // when the View is destroyed or refreshed during development live-reload.
  const bgGeoEventSubscriptions:Subscription[] = [];
	/// Adds events to List
  const addEvent = (name:string, params:any) => {
    let timestamp = new Date();
    const event = {
      expanded: false,
      timestamp: `${timestamp.getMonth()}-${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`,
      name: name,
      params: JSON.stringify(params, null, 2)
    }
    setEvents(previous => [...previous, event]);
  }
	 /// Configure the BackgroundGeolocation plugin.
  const initBackgroundGeolocation = async () => {
    // Listen to events.  Each BackgroundGeolocation event-listener returns a subscription instance
    // with a .remove() method for removing the event-listener.  You should collect a list of these
    // subcribers and .remove() them all when the View is destroyed or refreshed during dev live-reload.
    subscribe(BackgroundGeolocation.onProviderChange((event) => {
      console.log('[onProviderChange]', event);
      addEvent('onProviderChange', event);
    }));

    subscribe(BackgroundGeolocation.onLocation((location) => {
      console.log('[onLocation]', location);
      addEvent('onLocation', location);
    }, (error) => {
      console.warn('[onLocation] ERROR: ', error);
    }));

    subscribe(BackgroundGeolocation.onMotionChange((location) => {
      console.log('[onMotionChange]', location);
			if(timer.isPaused && location.isMoving) {
					setTimer(prev => ({ ...prev, isPaused: false }));
			};
			if(!timer.isPaused && !location.isMoving) {
					setTimer(prev => ({ ...prev, isPaused: true }));
			};
      addEvent('onMotionChange', location);
    }));

    subscribe(BackgroundGeolocation.onGeofence((event) => {
      console.log('[onGeofence]', event);
      addEvent('onGeofence', event);
    }));

    subscribe(BackgroundGeolocation.onConnectivityChange((event) => {
      console.log('[onConnectivityChange]', event);
      addEvent('onConnectivityChange', event);
    }));

    subscribe(BackgroundGeolocation.onEnabledChange((enabled) => {
      console.log('[onEnabledChange]', enabled);
      addEvent('onEnabledChange', {enabled: enabled});
    }));

		subscribe(BackgroundGeolocation.onActivityChange((event) => {
			console.log('[onActivityChange]', event);
			if(event.activity.type === 'on_bicycle' || event.activity.type === 'in_vehicle') {
				setTimer(prev => ({ ...prev, isPaused: true }));

			} else {
				setTimer(prev => ({ ...prev, isPaused: false }));
			}
			addEvent('onActivityChange', event);

		}));

		subscribe(BackgroundGeolocation.onPowerSaveChange((enabled) => {
			console.log('[onPowerSaveChange]', enabled);
			addEvent('onPowerSaveChange', {isPowerSaveMode: enabled});
		}));
		/// Configure the plugin.
		BackgroundGeolocation.ready({
			// Geolocation Config
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
			distanceFilter: 1,
			// Activity Recognition
			stopTimeout: 1,
			// Application config
			debug: true,              // <-- enable this hear debug sounds.
			logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
			stopOnTerminate: true,   // <-- Allow the background-service to continue tracking when app terminated.
			startOnBoot: false,        // <-- Auto start tracking when device is powered-up.
				}, (state) => {
				console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
				/// Add the current state as first item in list.
				addEvent('Current state', state);
				if (!state.enabled) {
					////
					// 3. Start tracking!
					//
					BackgroundGeolocation.start(function() {
						console.log("- Start success");
					});
				}
			});
	};

//	React.useEffect(() => {
//		async function changeIsMoving() {
//			await BackgroundGeolocation.changePace(true)
//		}
//		let timeout;
//		if(timer.isPaused) {
//			timeout = setTimeout(() => {
//				changeIsMoving();
//			}, 3000);
//		} 
//		return () => {
//			clearTimeout(timeout);
//		}
//	}, [timer]);
   /// Init BackgroundGeolocation when view renders.
  /// Return a function to .removeListeners() When view is removed.
  React.useEffect(() => {
    //initBackgroundFetch();  // <-- optional
    initBackgroundGeolocation();
    //registerTransistorAuthorizationListener(navigation);
    return () => {
      // Remove BackgroundGeolocation event-subscribers when the View is removed or refreshed
      // during development live-reload.  Without this, event-listeners will accumulate with
      // each refresh during live-reload.
			console.log('PhysicalSession: Unsubscribing from BackgroundGeolocation events');
      unsubscribe();
    }
  }, []);

  /// Helper method to push a BackgroundGeolocation subscription onto our list of subscribers.
  const subscribe = (subscription:Subscription) => {
    bgGeoEventSubscriptions.push(subscription);
  }
	/// Helper method to unsubscribe from all registered BackgroundGeolocation event-listeners.
  const unsubscribe = () => {
    bgGeoEventSubscriptions.forEach((subscription:Subscription) => subscription.remove() );
  }

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
  return (
    <View style={styles.container}  testID="physical-session-screen">
			<PhysicalSessionTimer
					timer={timer}
					setTimer={setTimer}
				/>

      {/* <Switch value={enabled} onValueChange={setEnabled} /> */ }
			{/*
				<Text style={{fontFamily:'monospace', fontSize:12, color:'red'}}>{location}</Text>
			*/}
			<View style={styles.trailNameContainer}>
					<Text style={styles.trailName} testID="current-trail-name">{currentTrail.trailName}</Text>
					<EnhancedDistanceProgressBar
						timer={timer}
						sessionDetails={sessionDetails}
						user={user}
						trail={currentTrail}
						
					/>
			</View>
			<View style={styles.statsContainer}>
					<View style={styles.statsGrid}>
						<StatBox label="Distance" value={`${sessionDetails.totalDistanceHiked} mi.`} />
						<StatBox label="Sets" value={`${timer.completedSets} / ${timer.sets}`} />
						<StatBox  label="Strikes" value={sessionDetails.strikes} />
						<StatBox label="Reward" value={Number( sessionDetails?.trailTokensEarned + sessionDetails?.sessionTokensEarned )} />
						<StatBox  label="Achievements" value={earnedAchievements.length} />
						<StatBox  label="Trails" value={sessionCompletedTrails.length} />
					</View>
				</View>


    </View>
  )
}
const StatBox = ({ label, value }) => (
	<View style={styles.infoBox}>
		<Text style={styles.infoLabel}>{label}</Text>
		<Text testID={label.toLowerCase()} style={styles.infoValue}>{value}</Text>
	</View>
);

const enhance = withObservables(['user', 'currentTrail', 'completedTrails', 'queuedTrails', 'userSession', 'usersAchievements'], ({ user, userSession }) => ({
	user: user.observe(),
	currentTrail: user.trail.observe(),
	completedTrails: user.usersCompletedTrails.observe(),
	queuedTrails: user.usersQueuedTrails.observe(),
	userSession,
	userAchievements: user.usersAchievements.observe(),
}));
const EnhancedPhysicalSession = enhance(PhysicalSession);

export default EnhancedPhysicalSession;

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

