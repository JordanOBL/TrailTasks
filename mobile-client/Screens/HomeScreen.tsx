import {
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Rive, { RiveRef } from 'rive-react-native';
import {
   User,
   User_Wild,
} from '../watermelon/models';
import { darkTheme, lightTheme } from '../theme';

import Carousel from 'react-native-reanimated-carousel';
import DistanceProgressBar from '../components/DistanceProgressBar';
import HomeScreenLinks from '../components/HomeScreen/HomeScreenLinks'
import { Q } from '@nozbe/watermelondb';
import { Rank } from '../helpers/Ranks/ranksData';
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import SyncButton from '../components/syncButton';
import TutorialModal from '../components/HomeScreen/tutorialModal';
import WildAvatar from '../components/Wilds/WildAvatar';
import XpRing from '../components/HomeScreen/XpRing';
import checkDailyStreak from '../helpers/Session/checkDailyStreak';
import getUserRank from '../helpers/Ranks/getUserRank';
import handleError from '../helpers/ErrorHandler';
import { hasUnsyncedChanges } from '@nozbe/watermelondb/sync';
import {sync} from '../watermelon/sync';
import {useAuthContext} from '../services/AuthContext';
import {useDatabase} from '@nozbe/watermelondb/react';
import {useFocusEffect} from '@react-navigation/native';
import {useInternetConnection} from '../contexts/InternetConnectionProvider';
import useRevenueCat from '../helpers/RevenueCat/useRevenueCat';
import {useTheme} from '../contexts/ThemeProvider';
import { withObservables } from '@nozbe/watermelondb/react';

interface Props {
    user: User;
    currentTrail?: any;
    navigation: any;
    setUser: any;
    userWilds:any;
    activeWilds: User_Wild[];

}

const HomeScreen: React.FC<Props> = ({
                                         user,
                                         navigation,
                                         currentTrail,
                                         userWilds,
                                         activeWilds
                                     }) => {
    const watermelonDatabase = useDatabase();
    const {theme} = useTheme();

    const userRankRef = React.useRef<Rank | undefined>({
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
    const {currentOffering, customerInfo, isProMember } = useAuthContext();
    userRankRef.current = React.useMemo(() => getUserRank(user?.totalMiles), [user?.totalMiles]);
    const [activeWild]  = activeWilds
    

    const handleTutorialClose = () => {
        setShowTutorial(false); // Close the tutorial modal
    };
     const riveRef = React.useRef<RiveRef>(null);

  function wave()
  {
       console.log(riveRef)
       riveRef.current?.fireState('State Machine 1', 'wave');
     }
     function getRandom() {
       return Math.floor(Math.random() * 3000) + 5000; // Between 2s–5s
     }

    //this useEffect checks daily streak and resets if needed
    React.useEffect(() => {
      console.log('userWilds', userWilds)
      console.log(activeWild)
      if (user) {
        checkDailyStreak(user);
      }
      //Check to see if user is new to the app by checking if theyve hiked any miles
      //if not, show the tutorial Modal
      // Check if the user has any miles hiked

      if (user?.totalMiles <= 0.0) {
        setShowTutorial(true); // Show the tutorial if the user has no miles hiked
      } else {
        setShowTutorial(false);
      }
    }, [user, userWilds]);
    // React.useEffect(() => {
    //   let timeout: string | number | NodeJS.Timeout | null | undefined = null;

    //   function scheduleWave() {
    //     const delay = getRandom();

    //     console.log(delay)
    //     timeout = setTimeout(() => {
    //       if (riveRef.current)
    //       {
    //         wave();
    //       }
    //       scheduleWave(); // Recurse to schedule the next blink
    //     }, delay);
    //   }

    //   scheduleWave(); // Start the blinking loop

    //   return () => {
    //     clearTimeout(timeout); // Clean up on unmount
    //   };
    // }, [riveRef]);



    //this useEffect gets the correct Rank based on  the users miles
    useFocusEffect(
        React.useCallback(() => {
            async function checkUnsyncedChanges() {
              const results = await hasUnsyncedChanges({
                database: watermelonDatabase,
              });
              return results;
            }
            if (!user) {
                return;
            }

            checkUnsyncedChanges().then(result => {
                if (result) {
                     sync(watermelonDatabase,isConnected, user.id).catch(err =>handleError(err, 'useCallback sync HomeScreen'));
                }
            });


            return async () => {
                console.log('Home Screen was unfocused');
            };


        }, [user, watermelonDatabase, isConnected])
    );
    return !user || !currentTrail ? (
      <View testID="homescreen-loading" style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Your Data...</Text>
      </View>
    ) : (
      <SafeAreaView testID="homescreen" style={styles.container}>
        {/* <SyncIndicator delay={3000} /> */}
        {showTutorial && <TutorialModal onClose={handleTutorialClose} />}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.trailTokens}>Trail Tokens: {user?.trailTokens}</Text>
          <Text style={[styles.onlineStatus, { color: isConnected ? "green" : "red" }]}>
            {isConnected ? "Online" : "Offline"}
          </Text>
          <View>
            <Text style={styles.dailyStreak} testID="daily-streak">
              Daily Streak: {user?.dailyStreak}
            </Text>
            <SyncButton />
          </View>
        </View>
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          {activeWild ? <XpRing size={120} xp={activeWild.xp} xpToLevel={activeWild.xpToNext} ringColor={'#00998aff'}>
            <WildAvatar id={activeWild.wildId} pose={"still"} size={120} />
          </XpRing> :
          <Text style={styles.wildInfo}>No Active Wild</Text>
          }
        </View>
        <View style={styles.currentTrailContainer}>
          <Text style={styles.trailText}>Current Trail:</Text>
          <Text style={styles.trailName}>{currentTrail.trailName}</Text>
          <DistanceProgressBar user={user} trail={currentTrail} height={15} borderRadius={999} barColor={'#00998aff'}/>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.ctaButton, { marginTop: 15 }]}
            onPress={() => navigation.navigate("Timer")}
          >
            <Text style={styles.ctaText}>Start a Session</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.paginationDotsContainer}>
          {data.map((item, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                activeIndex === index && styles.activePaginationDot,
              ]}
            />
          ))}
        </View> */}
        <HomeScreenLinks user={user} navigation={navigation} />
      </SafeAreaView>
    );
};

const enhance = withObservables(['user'], ({user}) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    userSessions: user.usersSessions.observe(),
    userWilds: user.usersWilds.observe(),
    activeWilds: user.usersWilds.extend(Q.where('is_active', true), Q.take(1)).observe(),
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
    ctaButton: {
    backgroundColor: theme.progressBar,   // neon teal
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',

    // full width but with some margin – adjust to taste in parent
    alignSelf: 'stretch',

    // subtle glow / elevation
    shadowColor: theme.progressBar,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaText: {
    color: '#000',          // black text pops on teal
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
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
      position: 'relative',
      borderRadius: 12,
      alignItems: 'center',
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
          elevation: 4,

    },
    rankImage: {
        width: 256,
        height: '100%',
    },
    rankLevel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.button,
    },
    rankTitle: {
      fontSize: 10,
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
    wildInfo: {
          color: 'white',
          fontSize: 10,
    },

  });

