import * as React from 'react';
import { hasUnsyncedChanges } from '@nozbe/watermelondb/sync'
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {
    Subscription,
    User,
    User_Session,
} from '../watermelon/models';
import {useFocusEffect} from '@react-navigation/native';

import Carousel from 'react-native-reanimated-carousel';
import DistanceProgressBar from '../components/DistanceProgressBar';
import {Pressable} from 'react-native';
import Ranks from '../helpers/Ranks/ranksData';
import ScreenLink from '../components/HomeScreen/screenLink';
import SyncIndicator from '../components/SyncIndicator';
import TutorialModal from '../components/HomeScreen/tutorialModal';
import checkInternetConnection from '../helpers/InternetConnection/checkInternetConnection';
import getUserRank from '../helpers/Ranks/getUserRank';
import {handleLogOut} from '../helpers/logoutHelpers';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/react';
//import useRevenueCat from '../helpers/RevenueCat/useRevenueCat';
import {withObservables} from '@nozbe/watermelondb/react';
import isYesterday from '../helpers/isYesterday';
import isToday from '../helpers/isToday';
import checkDailyStreak from '../helpers/Session/checkDailyStreak';
import handleError from "../helpers/ErrorHandler";


interface Rank {
    level: string;
    group: string;
    image?: any;
    range: number[];
    title: string;
}

interface Props {
    user: User;
    currentTrail?: any;
    navigation: any;
    setUser: any;
    userSubscription: Subscription;
    userSessions: User_Session[];
}

const HomeScreen: React.FC<Props> = ({
                                         navigation,
                                         user,
                                         setUser,
                                         currentTrail,
                                         userSubscription,
                                         userSessions,
                                     }) => {
    const watermelonDatabase = useDatabase();
    const [userRank, setUserRank] = React.useState<Rank | undefined>();
    const [isConnected, setIsConnected] = React.useState<boolean | null>(false);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const data = [...new Array(2).keys()]; // Your data array
    const width = Dimensions.get('window').width;
    const [showTutorial, setShowTutorial] = React.useState(false);




    const handleTutorialClose = () => {
        setShowTutorial(false); // Close the tutorial modal
    };

    async function checkUnsyncedChanges() {
        const results = await hasUnsyncedChanges({database: watermelonDatabase} )
        return results;
    }

    //this useEffect checks daily streak and resets if needed
    React.useEffect(() => {
        async function resetDailyStreak() {
            if (
                !isYesterday(user.lastDailyStreakDate) &&
                !isToday(user.lastDailyStreakDate)
            ) {
                console.debug('resetting dailyStreak', user.lastDailyStreakDate);
                await user.resetDailyStreak();
            }
        }
        if (user && user.lastDailyStreakDate) {
            resetDailyStreak();
        }
    }, [user]);


    //this useEffect checks if a phone is connected to the internet
    React.useEffect(() => {
        async function isConnected() {
            // @ts-ignore
            const {isConnected} = await checkInternetConnection();
            setIsConnected(isConnected);
        }
        isConnected();
    }, []);

    //Check to see if user is new to the app by checking if theyve hiked any miles
    //if not, show the tutorial Modal
    React.useEffect(() => {
        // Check if the user has any miles hiked
        if ( !user?.totalMiles) {
            setShowTutorial(true); // Show the tutorial if the user has no miles hiked
        }
    }, [user]);

    //this useEffect gets the correct Rank based on  the users miles
    useFocusEffect(
        React.useCallback(() => {
            const rank = getUserRank(Ranks, user?.totalMiles);
            setUserRank(rank);
            checkUnsyncedChanges().then(result => {
                if (result) {
                     sync(watermelonDatabase, user.id).catch(err =>handleError(err, 'useCallback sync HomeScreen'));
                }
            })


            return async () => {
                console.log('Home Screen was unfocused');
            };


        }, [watermelonDatabase, user])
    );

    return !user || !currentTrail  ? (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Your Data...</Text>
        </View>
    ) : (
        <View style={styles.container}>
            {/* <SyncIndicator delay={3000} /> */}
            {<TutorialModal visible={showTutorial} onClose={handleTutorialClose} />}

            <View
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                }}>
                <Text style={styles.trailTokens}>Trail Tokens: {user.trailTokens}</Text>
                <Text style={styles.onlineStatus}>
                    {isConnected ? 'Online' : 'Offline'}
                </Text>
                <Text style={styles.dailyStreak}>
                    Daily Streak: {user.dailyStreak}
                </Text>
            </View>
<View style={{height: 200}}>
            <Carousel
                loop
                pagingEnabled={true}
                snapEnabled={true}
                width={width}
                height={width / 2}
                autoPlay={false}
                data={[...new Array(2).keys()]}
                scrollAnimationDuration={1000}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={({index}) => (
                    <View style={styles.carouselItem}>
                        {userRank && index === 0 ? (
                            <View style={styles.rankContainer}>
                                <Image
                                    source={userRank?.image}
                                    style={styles.rankImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.rankLevel}>Rank {userRank?.level}</Text>
                                <Text style={styles.rankTitle}>
                                    {userRank?.group} {userRank?.title}
                                </Text>
                                <Text style={styles.username}>{user.username}</Text>
                            </View>
                        ) : (
                            <View style={styles.currentTrailContainer}>
                                <Text style={styles.trailText}>Current Trail:</Text>
                                <Text style={styles.trailName}>{currentTrail.trailName}</Text>
                                 <DistanceProgressBar user={user} trail={currentTrail} />
                            </View>
                        )}
                    </View>
                )}
            />
            </View>
            <View style={styles.paginationDotsContainer}>
                {data.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.paginationDot,
                            activeIndex === index && styles.activePaginationDot,
                        ]}
                    />
                ))}
            </View>
            <ScrollView style={styles.linkContainer}>
                <ScreenLink
                    user={user}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        true
                    }
                    navigation={navigation}
                    navTo={'Stats'}>
                    Stats
                </ScreenLink>
                <ScreenLink
                    user={user}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        true
                    }
                    navigation={navigation}
                    navTo={'Shop'}>
                    Shop
                </ScreenLink>

                <ScreenLink
                    user={user}
                    needsActiveSubscription={true}
                    hasActiveSubscription={
                       false
                    }
                    navigation={navigation}
                    navTo={'HikingQueue'}>
                    Hiking Queue
                </ScreenLink>
                <ScreenLink
                    needsActiveSubscription={true}
                    hasActiveSubscription={
                        false
                    }
                    user={user}
                    navigation={navigation}
                    navTo={'Friends'}>
                    Friends
                </ScreenLink>
                <ScreenLink
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        true
                    }
                    user={user}
                    navigation={navigation}
                    navTo={'Badges'}>
                    Badges
                </ScreenLink>
                <ScreenLink
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        true
                    }
                    user={user}
                    navigation={navigation}
                    navTo={'Achievements'}>
                    Achievements
                </ScreenLink>
                <ScreenLink
                    user={user}
                    navigation={navigation}
                    navTo={'Leaderboards'}
                    needsActiveSubscription={true}
                    hasActiveSubscription={
                        true
                    }>
                    Leaderboards
                </ScreenLink>
                {/*<ScreenLink*/}
                {/*    user={user}*/}
                {/*    navigation={navigation}*/}
                {/*    navTo={'CompletedHikes'}*/}
                {/*    needsActiveSubscription={true}*/}
                {/*    hasActiveSubscription={*/}
                {/*       true*/}
                {/*    }>*/}
                {/*    Completed Trails*/}
                {/*</ScreenLink>*/}
                <ScreenLink
                    user={user}
                    navigation={navigation}
                    navTo={'Settings'}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        false
                    }>
                    Settings
                </ScreenLink>

                <Pressable
                    onPress={async () => handleLogOut(setUser, watermelonDatabase)}
                    style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
};

const enhance = withObservables(['user'], ({user}) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    userSessions: user.usersSessions.observe(),
}));

const EnhancedHomeScreen = enhance(HomeScreen);
export default EnhancedHomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(18, 19, 21)',
        padding: 10,
    },
    dailyStreak: {
        color: 'rgb(7, 254, 213)',
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        fontSize: 18,
    },
    onlineStatus: {
        color: 'green',
        textAlign: 'center',
        fontSize: 12,
    },
    username: {
        color: 'rgb(249, 253, 255)',
        fontSize: 12,
        fontWeight: '800',
        paddingHorizontal: 10,
    },
    carouselItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginVertical: 10,
        paddingRight: 20,
    },
    rankContainer: {
        alignItems: 'center',
    },
    rankImage: {
        width: 80,
        height: 80,
    },
    rankLevel: {
        color: 'rgb(249, 253, 255)',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    rankTitle: {
        color: 'rgb(249, 253, 255)',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    currentTrailContainer: {
        padding: 10,
        width: '100%',
        backgroundColor: 'rgb(28, 29, 31)',
        borderColor: 'rgb(7, 254, 213)',
        borderWidth: 1,
        borderRadius: 10,
    },
    trailText: {
        color: 'rgba(221, 224, 226, .7)',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    trailName: {
        color: 'rgb(249, 253, 255)',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    trailTokens: {
        color: 'rgb(7, 254, 213)',
        fontSize: 12,
    },
    paginationDotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        borderColor: 'rgb(7, 254, 213)',
        borderWidth: 0.3,
        marginHorizontal: 4,
        backgroundColor: 'black',
    },
    activePaginationDot: {
        backgroundColor: 'rgb(7, 254, 213)',
    },
    linkContainer: {
        marginTop: 10,
        backgroundColor: 'rgb(18, 19, 21)',
    },
    logoutButton: {
        borderColor: 'rgb(31, 33, 35)',
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: 'rgb(31, 33, 35)',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgb(221, 224, 226)',
        fontWeight: '900',
        marginBottom: 10,
        padding: 20,
    },
    logoutButtonText: {
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
