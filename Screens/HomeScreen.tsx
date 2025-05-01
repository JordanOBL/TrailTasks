import * as React from 'react';
import { hasUnsyncedChanges } from '@nozbe/watermelondb/sync'
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
    SafeAreaView,
} from 'react-native';
import {
    Subscription,
    User,
    User_Session,
} from '../watermelon/models';
import {useFocusEffect} from '@react-navigation/native';
import {useAuthContext} from '../services/AuthContext';
import Carousel from 'react-native-reanimated-carousel';
import DistanceProgressBar from '../components/DistanceProgressBar';
import {Pressable} from 'react-native';
import ScreenLink from '../components/HomeScreen/screenLink';
import SyncIndicator from '../components/SyncIndicator';
import TutorialModal from '../components/HomeScreen/tutorialModal';
import getUserRank from '../helpers/Ranks/getUserRank';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/react';
import {useInternetConnection} from '../hooks/useInternetConnection';
//import useRevenueCat from '../helpers/RevenueCat/useRevenueCat';
import {withObservables} from '@nozbe/watermelondb/react';
import isYesterday from '../helpers/isYesterday';
import isToday from '../helpers/isToday';
import checkDailyStreak from '../helpers/Session/checkDailyStreak';
import handleError from "../helpers/ErrorHandler";
import SyncButton from "../components/syncButton"


interface Props {
    user: User;
    currentTrail?: any;
    navigation: any;
    setUser: any;
    userSubscription: Subscription;
    userSessions: User_Session[];
}

const HomeScreen: React.FC<Props> = ({
                                         user,
                                         navigation,
                                         currentTrail,
                                         userSubscription,
                                         userSessions,
                                     }) => {
    const watermelonDatabase = useDatabase();
    const userRankRef = React.useRef<Rank>({
        level: 'loading',
        group: 'loading',
        image: null,
        range: [],
        title: 'loading'});
    const {isConnected} = useInternetConnection();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const data = [...new Array(2).keys()]; // Your data array
    const width = Dimensions.get('window').width;
    const [showTutorial, setShowTutorial] = React.useState(false);
    const {logout} = useAuthContext();

 userRankRef.current = React.useMemo(() => getUserRank(user?.totalMiles), [user?.totalMiles]);

    const handleTutorialClose = () => {
        setShowTutorial(false); // Close the tutorial modal
    };

    async function checkUnsyncedChanges() {
        const results = await hasUnsyncedChanges({database: watermelonDatabase} )
        return results;
    }

    //this useEffect checks daily streak and resets if needed
    React.useEffect(() => {
        if(user){
         checkDailyStreak(user)
        }
       //Check to see if user is new to the app by checking if theyve hiked any miles
    //if not, show the tutorial Modal
           // Check if the user has any miles hiked
        
        if (user?.totalMiles <= 0.00) {
            setShowTutorial(true); // Show the tutorial if the user has no miles hiked
        }else{
            setShowTutorial(false);
        }

    }, [user]);


    

    //this useEffect gets the correct Rank based on  the users miles
    useFocusEffect(
        React.useCallback(() => {
            if (!user) {
                return;
            }
            
            checkUnsyncedChanges().then(result => {
                if (result) {
                     sync(watermelonDatabase,isConnected, user.id).catch(err =>handleError(err, 'useCallback sync HomeScreen'));
                }
            })


            return async () => {
                console.log('Home Screen was unfocused');
            };


        }, [watermelonDatabase, user])
    );
    return !user || !currentTrail  ? (
        <View testID="homescreen-loading" style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Your Data...</Text>
        </View>
    ) : (
            <SafeAreaView testID="homescreen" style={styles.container}>
                {/* <SyncIndicator delay={3000} /> */}
               {showTutorial && <TutorialModal  onClose={handleTutorialClose} />} 
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                    <Text style={styles.trailTokens}>Trail Tokens: {user?.trailTokens}</Text>
                    <Text style={styles.onlineStatus}>
                        {isConnected ? 'Online' : 'Offline'}
                    </Text>
                    <View>
                        <Text style={styles.dailyStreak} testID="daily-streak">
                            Daily Streak: {user?.dailyStreak}
                        </Text>
                        <SyncButton />
                    </View>

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
                        {userRankRef.current && index === 0 ? (
                            <View style={styles.rankContainer}>
                                <Image
                                    source={userRankRef.current?.image}
                                    style={styles.rankImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.rankLevel}>Rank {userRankRef.current?.level}</Text>
                                <Text style={styles.rankTitle}>
                                    {userRankRef.current?.group} {userRankRef.current?.title}
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
                        user={user}
                    needsActiveSubscription={true}
                    hasActiveSubscription={
                        true
                    }
                    navigation={navigation}
                    navTo={'Friends'}>
                    Friends
                </ScreenLink>
                <ScreenLink
                        user={user}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        true
                    }
                    navigation={navigation}
                    navTo={'Park Passes'}>
                    Park Passes
                </ScreenLink>
                <ScreenLink
                        user={user}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        true
                    }
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
                    onPress={() => logout()}
                    style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
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
        display: 'flex',
        flexDirection: 'column'
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
    rankContainer: { borderWidth: 1,
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
    paginationDotsContainer: { borderWidth: 1,
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
        marginBottom: 10,
        padding: 20,
    },
    logoutButtonText: {
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
