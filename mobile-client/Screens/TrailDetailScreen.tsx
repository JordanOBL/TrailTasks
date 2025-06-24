import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import { useTheme } from '../contexts/ThemeProvider';
import { useAuthContext } from '../services/AuthContext';
import BuyTrailModal from '../components/Trails/BuyTrailModal';
import formatDateTime from '../helpers/formatDateTime';
import calculateEstimatedTime from '../helpers/calculateEstimatedTime';
import {useNavigation} from '@react-navigation/native';

const TrailDetailScreen = ({ route, user, queuedTrails, userPurchasedTrails, completedTrails, }) => {
  const { trail} = route?.params ?? {};
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { isProMember } = useAuthContext();
  const navigation = useNavigation();
  const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
  const [showBuyTrailModal, setShowBuyTrailModal] = useState(false);
  const isFreeTrail = trail?.is_free;
  const isPurchased = userPurchasedTrails?.some(t => t.trailId == trail.id);
  const isSubscribersOnly = trail?.is_subscribers_only;
  const isCompleted = completedTrails?.some(t => t.trailId == trail.id);
  const isQueued = queuedTrails?.some(t => t.trailId == trail.id);

  const trailDistance = parseInt(trail?.trail_distance);
  const reward = trail?.trail_of_the_week
    ? Math.ceil(trailDistance) * 10
    : Math.max(5, Math.ceil(trailDistance * 3));

  const getPurchaseButtonText = () => {
    if (user.trailId === trail?.id) return 'In Progress';
    if (isFreeTrail || isPurchased) return 'Start Now';
    if (isSubscribersOnly && !isProMember) return 'Unlock With Subscription';
    return `Buy ${reward}`;
  };

  const handleReplaceTrail = async () => {
    await user.updateUserTrail({
      trailId: trail.id,
      trailStartedAt: formatDateTime(new Date()),
    });
    setShowReplaceTrailModal(false);
  };

  const handleBuyTrail = () => setShowBuyTrailModal(true);

  return (
    <ScrollView style={styles.container}>
      <Modal transparent visible={showReplaceTrailModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start New Trail</Text>
            <Text style={styles.modalText}>
              Are you sure you want to replace your current trail?
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.linkButton} onPress={() => setShowReplaceTrailModal(false)}>
                <Text style={styles.fullButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} onPress={handleReplaceTrail}>
                <Text style={styles.fullButtonText}>Start New</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BuyTrailModal
        isVisible={showBuyTrailModal}
        onClose={() => {
          setShowBuyTrailModal(false);
          navigation.goBack();
        }}
        trail={trail}
        trailTokens={user.trailTokens}
        onBuyTrail={async () => {
          await user.purchaseTrail(trail, reward)
        }}
      />

      <Image
        style={styles.trailImage}
        source={trail.trail_image_url ? { uri: trail.trail_image_url } : require('../assets/LOGO.png')}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.trailName}>{trail.trail_name}</Text>
        <Text style={styles.parkName}>{trail.park_name}, {trail?.state_code}</Text>
        <Text style={styles.statusText}>{isCompleted ? '✅ Completed' : 'Not Completed'}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}><Text style={styles.statValue}>{trail.trail_distance} mi</Text><Text style={styles.statLabel}>Distance</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{trail.trail_elevation} ft</Text><Text style={styles.statLabel}>Elevation</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{calculateEstimatedTime(trail.trail_distance)}</Text><Text style={styles.statLabel}>Est. Time</Text></View>
          <View style={styles.statBox}><Text style={styles.statValue}>{reward}</Text><Text style={styles.statLabel}>Reward</Text></View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity

            onPress={async () => {
              if (isQueued) {
                const result = await user.deleteFromQueuedTrails({trailId: trail.id});
                if(!result){
                  Alert.alert('Error', 'Could not remove from queue. Please try again later.');
                }
                

              } else {
                const result = await user.addToQueuedTrails({trailId: trail.id});
                if(!result){
                  Alert.alert('Error', 'Could not add to queue. Please try again later.');
                }
              }
              
            }}
            disabled={!isProMember || user.trailId === trail.id || (!isPurchased && !isFreeTrail)}
            style={[styles.fullButton, { backgroundColor: isQueued ? 'red' : !isProMember 
              || (!isPurchased && !isFreeTrail) ? 'gray' : 'green' }]}
          >
            <Text style={styles.fullButtonText}>{isQueued ? 'Remove from Queue' : 'Add to Queue'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            disabled={user.trailId === trail.id}
            onPress={() => {
              if (isFreeTrail || isPurchased) {
                setShowReplaceTrailModal(true)

              }else if(isSubscribersOnly && !isProMember) {
                navigation.navigate('Basecamp', {
                  screen: 'Subscribe',
                });

                return
              }else {
                handleBuyTrail()
              }
            }}
            style={[styles.fullButton, { backgroundColor:  user.trailId == trail.id ? 'gray' : isProMember || isFreeTrail || isPurchased  || !isSubscribersOnly    ? '#2196F3' :  'gray' }]}
          >
            <Text style={styles.fullButtonText}>{getPurchaseButtonText()}</Text>
          </TouchableOpacity>
        </View>

        {(trail.nps_url || trail.all_trails_url || trail.hiking_project_url) && (
          <View style={styles.linksContainer}>
            <Text style={styles.sectionTitle}>🌐 Explore This Trail</Text>
            {trail.nps_url && <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(trail.nps_url)}><Text style={styles.linkText}>NPS Website</Text></TouchableOpacity>}
            {trail.all_trails_url && <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(trail.all_trails_url)}><Text style={styles.linkText}>AllTrails</Text></TouchableOpacity>}
            {trail.hiking_project_url && <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(trail.hiking_project_url)}><Text style={styles.linkText}>Hiking Project</Text></TouchableOpacity>}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  trailImage: { width: '100%', height: 240 },
  infoContainer: { padding: 20 },
  trailName: { fontSize: 24, fontWeight: 'bold', color: theme.trailHeaderText },
  parkName: { fontSize: 16, fontWeight: '500', color: theme.parkNameText },
  statusText: { fontSize: 12, color: 'gray', marginVertical: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: { width: '48%', backgroundColor: theme.card, padding: 10, borderRadius: 10, marginBottom: 12 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: theme.text, textAlign: 'center' },
  statLabel: { fontSize: 12, color: theme.secondaryText, textAlign: 'center' },
  buttonGroup: { marginTop: 20, gap: 10 },
  fullButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  fullButtonText: { color: theme.buttonText, fontSize: 16, fontWeight: '600' },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalText: { fontSize: 14, marginBottom: 20, textAlign: 'center' },
  linksContainer: { marginTop: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: theme.text },
  linkButton: { backgroundColor: theme.button, padding: 10, borderRadius: 10, marginBottom: 8, alignItems: 'center' },
  linkText: { color: theme.buttonText, fontWeight: '500' },
});

const enhance = withObservables(['user'], ({ user }) => ({
  user,
  completedTrails: user.usersCompletedTrails.observe(),
  userPurchasedTrails: user.usersPurchasedTrails.observe(),
  queuedTrails: user.usersQueuedTrails.observe(),
}));

export default enhance(TrailDetailScreen);

