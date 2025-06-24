import React, { useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EnhancedAddonListItem from '../AddOnStore/AddonListItem';
import { withObservables } from '@nozbe/watermelondb/react';

const NewSessionBackpack = ({
                              sessionDetails,
                              setSessionDetails,
                              user,
                              usersAddons,
                            }) => {
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [drawerAnimation] = useState(new Animated.Value(0));

  const openDrawer = (position) => {
    setSelectedPosition(position);
    setDrawerVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };

  const selectAddon = (addon) => {
    if (
        addon !== null &&
        sessionDetails.backpack.some(
            (slot) => slot.addon?.id === addon.id
        )
    ) {
      closeDrawer();
      alert('Addon already in backpack.\nAddons do not stack.');
      return;
    }
    const updatedBackpack = [...sessionDetails.backpack];
    updatedBackpack[selectedPosition].addon = addon;
    setSessionDetails({ ...sessionDetails, backpack: updatedBackpack });
    closeDrawer();
  };

  const drawerTranslateY = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={isDrawerVisible}
          onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
              style={[styles.modalContainer, { transform: [{ translateY: drawerTranslateY }] }]}
          >
            <Text style={styles.title}>Backpack Configuration</Text>
            <ScrollView style={styles.content}>
              {sessionDetails.backpack.map((slot, index) => (
                  <Pressable
                      key={index}
                      style={[
                        styles.addonSlot,
                        {
                          borderColor:
                              user.totalMiles >= slot.minimumTotalMiles
                                  ? 'rgb(7,254,213)'
                                  : 'grey',
                        },
                      ]}
                      disabled={user.totalMiles < slot.minimumTotalMiles}
                      onPress={() => openDrawer(index)}
                  >
                    <Text
                        style={{
                          color:
                              user.totalMiles >= slot.minimumTotalMiles
                                  ? 'rgb(7,254,213)'
                                  : 'grey',
                          fontWeight: 'bold',
                          fontSize:
                              user.totalMiles >= slot.minimumTotalMiles ? 18 : 14,
                        }}
                    >
                      {slot.addon
                          ? slot.addon.name
                          : user.totalMiles >= slot.minimumTotalMiles
                              ? '+'
                              : `Unlock at ${slot.minimumTotalMiles} miles`}
                    </Text>
                  </Pressable>
              ))}
              <View style={styles.addonDrawer}>
                <Text style={styles.drawerTitle}>Choose an Addon</Text>
                <ScrollView>
                  {sessionDetails.backpack[selectedPosition]?.addon ? (
                      <TouchableOpacity onPress={() => selectAddon(null)}>
                        <View style={styles.removeButton}>
                          <Text style={styles.removeButtonText}>Remove</Text>
                        </View>
                      </TouchableOpacity>
                  ) : null}
                  {usersAddons && usersAddons.length > 0 ? (
                      usersAddons.map((userAddon, index) => (
                          <EnhancedAddonListItem
                              key={index}
                              userAddon={userAddon}
                              selectAddon={selectAddon}
                          />
                      ))
                  ) : (
                      <Text style={styles.emptyText}>
                        Inventory empty. Visit the store to buy addons!
                      </Text>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
            <Pressable style={styles.closeButton} onPress={closeDrawer}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
  );
};

const enhance = withObservables(['user', 'usersAddons'], ({ user }) => ({
  user,
  usersAddons: user.usersAddons,
}));

export default enhance(NewSessionBackpack);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    marginBottom: 20,
  },
  addonSlot: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    marginVertical: 5,
  },
  addonDrawer: {
    marginTop: 10,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  removeButtonText: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
