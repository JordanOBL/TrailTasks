import React, { useEffect, useState } from 'react';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Trail, User, User_Addon, Park } from '../../watermelon/models';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useNavigation } from '@react-navigation/native';
import BackpackModal from "./BackpackModal";
import SettingsModal from './SettingsModal';
import NewSessionHandlers from '../../helpers/Session/newSessionHandlers';
import { Button, Badge } from 'react-native-paper';
import { SessionDetails } from '../../types/session';
import { Session_Category } from '../../watermelon/models';
import Timer from '../../types/timer';
import { withObservables } from '@nozbe/watermelondb/react';
import EnhancedDistanceProgressBar from '../DistanceProgressBar';
import formatCountdown from "../../helpers/Timer/formatCountdown";

interface Props {
    timer: Timer;
    setTimer: React.Dispatch<React.SetStateAction<Timer>>;
    sessionDetails: SessionDetails;
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>;
    setUserSession: React.Dispatch<React.SetStateAction<any>>;
    sessionCategories: Session_Category[];
    user: User;
    usersAddons: User_Addon[];
    currentTrail: Trail;
    currentPark: Park;
}

const NewSessionOptions = ({
                               timer,
                               setTimer,
                               sessionDetails,
                               setSessionDetails,
                               setUserSession,
                               sessionCategories,
                               user,
                               usersAddons,
                               currentTrail,
    currentPark,
                           }: Props) => {
    const watermelonDatabase = useDatabase();
    const navigation = useNavigation();
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
    const [isBackpackModalVisible, setIsBackpackModalVisible] = useState(false);

    const startSession = () => {
        if (!sessionDetails.startTime) {
            NewSessionHandlers.StartSessionClick({
                timer,
                setTimer,
                setSessionDetails,
                sessionDetails,
                user,
                database: watermelonDatabase,
            }).then((newSession: any) => {
                if (newSession) {
                    const sessionDetailsWithAddons = { ...sessionDetails };
                    const timerWithAddons = { ...timer };

                    sessionDetailsWithAddons.backpack.forEach((slot) => {
                        if (slot.addon) {
                            switch (slot.addon.effectType) {
                                case 'min_pace_increase':
                                    sessionDetailsWithAddons.minimumPace = slot.addon.effectValue;
                                    timerWithAddons.pace = slot.addon.effectValue;
                                    break;
                                case 'max_pace_increase':
                                    sessionDetailsWithAddons.maximumPace = slot.addon.effectValue;
                                    break;
                                case 'pace_increase_interval':
                                    sessionDetailsWithAddons.paceIncreaseInterval =
                                        slot.addon.effectValue;
                                    break;
                                case 'pace_increase_value':
                                    timerWithAddons.pace += slot.addon.effectValue;
                                    break;
                                case 'penalty_reduction':
                                    sessionDetailsWithAddons.penaltyValue -= slot.addon.effectValue;
                                    break;
                                case 'trail_token_bonus':
                                    sessionDetailsWithAddons.totalTokenBonus +=
                                        slot.addon.effectValue;
                                    break;
                                case 'break_time_reduction':
                                    sessionDetailsWithAddons.breakTimeReduction =
                                        slot.addon.effectValue;
                                    break;
                                default:
                                    break;
                            }
                        }
                    });

                    setUserSession(newSession);
                    setSessionDetails((prev) => ({
                        ...sessionDetailsWithAddons,
                        startTime: new Date().toISOString(),
                        isLoading: false,
                    }));
                    setTimer((prev) => ({
                        ...timerWithAddons,
                        isRunning: true,
                        startTime: new Date().toISOString(),
                    }));
                } else {
                    setSessionDetails((prev) => ({
                        ...prev,
                        isLoading: false,
                        isError: 'Error creating new session in StartSessionClick.',
                    }));
                }
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} testID="new-session-options">
            {/* Session Name */}
            <View style={styles.header}>
                <Text testID="session-name-display" style={styles.sessionName}>{sessionDetails.sessionName}</Text>
                <Text testID="session-category-display" style={styles.sessionCategory}>{sessionCategories.filter(item => item.id === sessionDetails.sessionCategoryId)[0]?.sessionCategoryName  || ""}</Text>

            </View>
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                    {formatCountdown(timer.time)}
                </Text>
            </View>
            {/* Trail Info and Progress Bar */}
            <View style={styles.middleContainer}>
                <Text style={styles.trailName}>{currentTrail.trailName}</Text>
                <Text style={styles.parkName}>{currentPark.parkName} National Park</Text>
                <EnhancedDistanceProgressBar
                    timer={timer}
                    sessionDetails={sessionDetails}
                    user={user}
                    trail={currentTrail}
                />
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <Button
                    icon="cog-outline"
                    mode="contained"
                    onPress={() => setIsSettingsModalVisible(true)}
                    style={styles.button}
                    testID="settings-modal-button"
                >
                    Settings
                </Button>

                <View style={styles.buttonWrapper}>
                    <Button
                        icon="bag-personal-outline"
                        mode="contained"
                        onPress={() => setIsBackpackModalVisible(true)}
                        style={styles.button}
                    >
                        Backpack
                    </Button>
                    {sessionDetails.backpack.filter(item => item.addon != null).length > 0 && (
                        <Badge style={styles.badge}>{sessionDetails.backpack.filter(item => item.addon != null).length}</Badge>
                    )}
                </View>

                <Pressable
                    testID="start-session-button"
                    onPress={startSession}
                    style={[
                        styles.startBtn,
                        {
                            backgroundColor:
                                sessionDetails.sessionName === '' ||
                                sessionDetails.sessionCategoryId == null
                                    ? '#444'
                                    : 'rgb(7,254,213)',
                        },
                    ]}
                    disabled={
                        sessionDetails.sessionName === '' ||
                        sessionDetails.sessionCategoryId == null
                    }
                >
                    <Text style={styles.startBtnText}>Start Session</Text>
                </Pressable>
            </View>

            {/* Settings Modal */}
            <SettingsModal
                timer={timer}
                setTimer={setTimer}
                isSettingsModalVisible={isSettingsModalVisible}
                sessionDetails={sessionDetails}
                setSessionDetails={setSessionDetails}
                watermelonDatabase={watermelonDatabase}
                setIsSettingsModalVisible={setIsSettingsModalVisible}
                sessionCategories={sessionCategories}
            />

            {/* Backpack Modal */}
            <BackpackModal
                isVisible={isBackpackModalVisible}
                onClose={() => setIsBackpackModalVisible(false)}
                sessionDetails={sessionDetails}
                setSessionDetails={setSessionDetails}
                user={user}
                usersAddons={usersAddons}
            />
        </SafeAreaView>
    );
};

const enhance = withObservables(['usersAddons', 'currentPark', 'user'], ({ user, currentTrail }) => ({
    user,
    usersAddons: user.usersAddons,
    currentPark: currentTrail.park,
}));

export default enhance(NewSessionOptions);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        paddingHorizontal: 20,
    },
    header: {
        paddingVertical: 20,
        backgroundColor: '#292929',
        alignItems: 'center',
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        textAlign: 'center',
    },
    sessionName: {
        color: 'rgb(7,254,213)',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    sessionCategory: {
        color: 'rgb(7,254,213)',
        fontSize: 14,
        fontWeight: 'semibold',
        textAlign: 'center',
    },
    middleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trailName: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    parkName: {
        color: 'white',
        opacity: 0.5,
        fontSize: 14,
        marginBottom: 15,
        letterSpacing: 1,
        fontWeight: 'thin',
        textAlign: 'center',
    },
    buttonsContainer: {
        bottom: 0,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#292929',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    button: {
        borderRadius: 8,
        backgroundColor: '#017371',
        marginBottom: 10,
    },
    buttonWrapper: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'rgb(128, 0, 128)',
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        zIndex: 10,
    },
    startBtn: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    startBtnText: {
        color: '#1c1c1c',
        fontSize: 18,
        fontWeight: '800',
    },
    timerContainer: {
        alignItems: 'center',
        margin:12,
    },
    timerText: {
        fontSize: 60,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'rgb(7,254,213)',
    },
});
