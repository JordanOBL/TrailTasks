import * as React from 'react';

import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Subscription, User, User_Miles} from '../watermelon/models';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

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
import {useDatabase} from '@nozbe/watermelondb/hooks';
import useRevenueCat from '../helpers/RevenueCat/useRevenueCat';
import withObservables from '@nozbe/with-observables';

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
  userSubscription: Subscription[];
  totalMiles: User_Miles[];
}

const HomeScreen: React.FC<Props> = ({
  navigation,
  user,
  setUser,
  currentTrail,
  userSubscription,
  totalMiles,
}) => {
  const watermelonDatabase = useDatabase();
  const [userRank, setUserRank] = React.useState<Rank | undefined>();
  const [isConnected, setIsConnected] = React.useState<boolean | null>(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const data = [...new Array(2).keys()]; // Your data array
  const width = Dimensions.get('window').width;
  const [showTutorial, setShowTutorial] = React.useState(false);
  const {currentOffering, customerInfo, isProMember} = useRevenueCat({
    userId: user.id,
  });

  const handleTutorialClose = () => {
    setShowTutorial(false); // Close the tutorial modal
  };

  //this useEffect checks if a phone is connected to the internet
  React.useEffect(() => {
    async function isConnected() {
      const {connection} = await checkInternetConnection();
      setIsConnected(connection?.isConnected);
    }
    isConnected();
  }, []);

  //Check to see if user is new to the app by checking if theyve hiked any miles
  //if not, show the tutorial Modal
  React.useEffect(() => {
    // Check if the user has any miles hiked
    if (totalMiles && parseFloat(totalMiles[0].totalMiles) <= 0.0) {
      setShowTutorial(true); // Show the tutorial if the user has no miles hiked
    }
  }, [user]);

  //this useEffect gets the correct Rank based on  the users miles
  useFocusEffect(
    React.useCallback(() => {
      sync(watermelonDatabase);
      const rank = getUserRank(Ranks, totalMiles[0].totalMiles);
      setUserRank(rank);
      return async () => {
        console.log('Home Screen was unfocused');
      };
    }, [watermelonDatabase, user, totalMiles])
  );

  return !user || !currentTrail ? (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading Your Data...</Text>
    </View>
  ) : (
    <View style={styles.container}>
      {/* <SyncIndicator delay={3000} /> */}
      {<TutorialModal visible={showTutorial} onClose={handleTutorialClose} />}
      <Text style={styles.onlineStatus}>
        {isConnected ? 'Online' : 'Offline'}
      </Text>
      <Text style={styles.username}>{user.username}</Text>
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
                  source={userRank.image}
                  style={styles.rankImage}
                  resizeMode="contain"
                />
                <Text style={styles.rankLevel}>Level {userRank.level}</Text>
                <Text style={styles.rankTitle}>
                  {userRank.group} {userRank.title}
                </Text>
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
            userSubscription[0] ? userSubscription[0].isActive : false
          }
          navigation={navigation}
          navTo={'Stats'}>
          Stats
        </ScreenLink>
        <ScreenLink
          user={user}
          needsActiveSubscription={true}
          hasActiveSubscription={
            userSubscription[0] ? userSubscription[0].isActive : false
          }
          navigation={navigation}
          navTo={'HikingQueue'}>
          Hiking Queue
        </ScreenLink>
        <ScreenLink
          needsActiveSubscription={true}
          hasActiveSubscription={
            userSubscription[0] ? userSubscription[0].isActive : false
          }
          user={user}
          navigation={navigation}
          navTo={'Friends'}>
          Friends
        </ScreenLink>
        <ScreenLink
          needsActiveSubscription={false}
          hasActiveSubscription={
            userSubscription[0] ? userSubscription[0].isActive : false
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
            userSubscription[0] ? userSubscription[0].isActive : false
          }>
          Leaderboards
        </ScreenLink>
        <ScreenLink
          user={user}
          navigation={navigation}
          navTo={'CompletedHikes'}
          needsActiveSubscription={true}
          hasActiveSubscription={
            userSubscription[0] ? userSubscription[0].isActive : false
          }>
          Completed Trails
        </ScreenLink>
        <ScreenLink
          user={user}
          navigation={navigation}
          navTo={'Settings'}
          needsActiveSubscription={false}
          hasActiveSubscription={
            userSubscription[0] ? userSubscription[0].isActive : false
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
  totalMiles: user.usersMiles.observe(),
  currentTrail: user.trail.observe(),
  userSubscription: user.usersSubscriptions.observe(),
}));

const EnhancedHomeScreen = enhance(HomeScreen);
export default EnhancedHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(18, 19, 21)',
    padding: 10,
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
    textAlign: 'right',
    marginVertical: 5,
  },
  username: {
    color: 'rgb(249, 253, 255)',
    fontSize: 26,
    fontWeight: '800',
    paddingHorizontal: 10,
  },
  carouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  rankContainer: {
    alignItems: 'center',
  },
  rankImage: {
    width: 100,
    height: 100,
  },
  rankLevel: {
    color: 'rgb(249, 253, 255)',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  rankTitle: {
    color: 'rgb(249, 253, 255)',
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
    fontSize: 22,
    fontWeight: 'bold',
  },
});
