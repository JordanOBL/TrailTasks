import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated, TouchableOpacity, ScrollView, Alert } from 'react-native';
import withObservables from '@nozbe/with-observables';
import EnhancedAddonListItem from '../AddOnStore/AddonListItem';
const SessionBackpack = ({ sessionDetails, setSessionDetails, user, usersAddons, addons }) => {
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [drawerAnimation] = useState(new Animated.Value(0));

  // Split the backpackLevels array into rows

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
    }).start(() => {
        setDrawerVisible(false);
      });
  };

  const selectAddon = (addon) => {
    if ( addon !== null && sessionDetails.backpack.some(slot => slot.addon?.id === addon.id)) {
      closeDrawer();
      Alert.alert('Addon already in backpack,\n addons DO NOT stack');
      return;
    }
    else{
    //const updatedSessionDetails = [...sessionDetails];
    const updatedBackpack = [...sessionDetails.backpack];
    updatedBackpack[selectedPosition].addon = addon;
    setSessionDetails({ ...sessionDetails, backpack: updatedBackpack });
    closeDrawer();
    }
  };

  const drawerTranslateY = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backpack (Addons)</Text>
      {sessionDetails.backpack.map((slot, index) => (
        <View 
          key={index} 
          style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            alignItems: 'center', 
            width: '100%', 

          }}
        >
          <Pressable 
            key={index+1} 
            style={[styles.selectedAddon, { borderColor: user.totalMiles >= slot.minimumTotalMiles ? 'rgb(7,254,213)' : 'grey' }]}
            disabled={user.totalMiles < slot.minimumTotalMiles}
            onPress={() => openDrawer(index)}
          >                
            <Text 
              style={{ 
                color: user.totalMiles >= slot.minimumTotalMiles ? 'rgb(7,254,213)' : 'grey', 
                fontWeight: 'bold', 
                fontSize: user.totalMiles >= slot.minimumTotalMiles ? 20 : 14,
              }}
            >
              {slot.addon ? slot.addon.name : user.totalMiles >= slot.minimumTotalMiles ? '+' :`Unlock at ${slot.minimumTotalMiles} miles` }
            </Text>
          </Pressable>

        </View>
      ))}
      {/* Users Addon Inventory Drawer*/}
      <Modal
        transparent
        visible={isDrawerVisible}
        animationType="none"
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeDrawer}>
          <Animated.View style={[styles.drawer, { transform: [{ translateY: drawerTranslateY }] }]}>
            <Text style={styles.drawerTitle}>Choose an Addon</Text>
            <ScrollView style={styles.drawerContent}> 
              {sessionDetails.backpack[selectedPosition]?.addon != null ? <TouchableOpacity onPress={() => selectAddon(null)}>
                <View style={styles.RemoveButtonContainer}>
                    <Text style={styles.addonName}>Remove</Text>
                </View>
              </TouchableOpacity> : null}
              {usersAddons && usersAddons.length > 0 ? (usersAddons.map((userAddon, index) => (
                <EnhancedAddonListItem key={index} userAddon={userAddon} selectAddon={selectAddon} />
              ))): <Text style={styles.addonText}>{`Inventory empty\n Visit the 'Shop' to buy Addons!`}</Text>}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const enhance = withObservables(['user', 'usersAddons'], ({ user, usersAddons }) => ({
  user,
  usersAddons: user.usersAddons,

}));

const EnhancedSessionBackpack = enhance(SessionBackpack);
export default EnhancedSessionBackpack;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    margin:10
  },
  selectedAddon: {
    width: '100%', 
    height: 50,
    margin: 5,
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  drawerContent: {
    height: '80%',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
    color: 'black',
  },
  addonItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  RemoveButtonContainer: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
});
