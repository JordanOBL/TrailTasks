import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Animated, TouchableOpacity, ScrollView } from 'react-native';
import withObservables from '@nozbe/with-observables';
import EnhancedAddonListItem from '../AddOnStore/AddonListItem';
const SessionBackpack = ({ sessionDetails, setSessionDetails, user, usersAddons, addons }) => {
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const backpackLevels = [0.0, 25.0, 50.0, 75.0];
  const [drawerAnimation] = useState(new Animated.Value(0));

  // Split the backpackLevels array into rows
  const rows = [];
  for (let i = 0; i < backpackLevels.length; i += 2) {
    rows.push(backpackLevels.slice(i, i + 2));
  }

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
    //const updatedSessionDetails = [...sessionDetails];
  
    closeDrawer();
  };

  const drawerTranslateY = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backpack (Addons)</Text>
      {rows.map((row, rowIndex) => (
        <View 
          key={rowIndex} 
          style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'space-around', 
            alignItems: 'center', 
            width: '80%', 
            marginBottom: 20 
          }}
        >
          {row.map((level, idx) => (
            <Pressable 
              key={idx} 
              style={[styles.selectedAddon, { borderColor: user.totalMiles >= level ? 'rgb(7,254,213)' : 'grey' }]}
              disabled={user.totalMiles < level}
              onPress={() => openDrawer(rowIndex * 2 + idx)}
            >                
              <Text 
                style={{ 
                  color: user.totalMiles >= level ? 'rgb(7,254,213)' : 'grey', 
                  fontWeight: 'bold', 
                  fontSize: 20 
                }}
              >
                {user.totalMiles >= level ? '+' : '-'}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      <Modal
        transparent
        visible={isDrawerVisible}
        animationType="none"
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeDrawer}>
          <Animated.View style={[styles.drawer, { transform: [{ translateY: drawerTranslateY }] }]}>
             <Text style={styles.drawerTitle}>Choose an Addon</Text>
            <ScrollView style={styles.drawerContent}> 
            {usersAddons ? (usersAddons.map((userAddon, index) => (
                  <EnhancedAddonListItem key={index} userAddon={userAddon} selectAddon={selectAddon} />
            ))): <Text style={styles.addonText}>No Addons Available</Text>}
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
    margin: 40,
  },
  selectedAddon: {
    width: 50, 
    height: 50, 
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
  },
  addonItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  addonText: {
    fontSize: 16,
    color: 'black',
  },
});
