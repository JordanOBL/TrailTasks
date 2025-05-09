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
import useRevenueCat from '../helpers/RevenueCat/useRevenueCat';
import {withObservables} from '@nozbe/watermelondb/react';
import isYesterday from '../helpers/isYesterday';
import isToday from '../helpers/isToday';
import checkDailyStreak from '../helpers/Session/checkDailyStreak';
import handleError from "../helpers/ErrorHandler";
import SyncButton from "../components/syncButton"
import {useTheme} from "../contexts/ThemeProvider";
import {useAuthContext} from "../services/AuthContext";
import {Rank} from "../types";


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
    const {theme} = useTheme();
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
    const styles = getStyles(theme); // dynamically generate styles based on theme
    const {currentOffering, customerInfo, isProMember } = useAuthContext() ;
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
        console.debug(currentOffering, customerInfo, isProMember);
        
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
                    <Text style={[ styles.onlineStatus, {color: isConnected ? 'green' : 'red'} ]}>
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
            <ScrollView style={styles.linkContainer}
  contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} // adjust for safety
  keyboardShouldPersistTaps="handled">
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
                       isProMember
                    }
                    navigation={navigation}
                    navTo={'Trail Queue'}>
                    Upcoming Trails
                </ScreenLink>
                <ScreenLink
                        user={user}
                    needsActiveSubscription={true}
                    hasActiveSubscription={
                        isProMember
                    }
                    navigation={navigation}
                    navTo={'Friends'}>
                    Friends
                </ScreenLink>
                <ScreenLink
                        user={user}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        isProMember
                    }
                    navigation={navigation}
                    navTo={'Park Passes'}>
                    Park Passes
                </ScreenLink>
                <ScreenLink
                        user={user}
                    needsActiveSubscription={false}
                    hasActiveSubscription={
                        isProMember
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
                        isProMember
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

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 10,

    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: theme.text,
      fontSize: 18,
    },
    dailyStreak: {
      fontSize: 13,
      color: theme.button, // accent color
      fontWeight: '600',
      textAlign: 'center',
    },
    onlineStatus: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    username: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '1800',
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
      borderRadius: 12,
      backgroundColor: theme.card,
      padding: 16,
      alignItems: 'center',
      width: '90%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    rankImage: {
      width: 72,
      height: 72,
      marginBottom: 12,
    },
    rankLevel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.button,
      marginBottom: 2,
    },
    rankTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.secondaryText,
      marginBottom: 6,
    },
    currentTrailContainer: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    trailText: {
      fontSize: 14,
      color: theme.secondaryText,
      fontWeight: '500',
      textAlign: 'center',
      marginBottom: 4,
    },
    trailName: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.button,
      textAlign: 'center',
      marginBottom: 8,
    },
    trailTokens: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.button,
    },
    paginationDotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 5,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    activePaginationDot: {
      backgroundColor: theme.button,
    },
    linkContainer: {
      marginTop: 10,
      backgroundColor: theme.background,
    },
 
  });

