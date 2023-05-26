import { StyleSheet, Text, View } from 'react-native';
import NearbyTrails from '../components/NearbyTrails';
import React from 'react'

const ExploreScreen = () => {
  return (
    <View>
      <Text>ExploreScreen</Text>
      <NearbyTrails sectionTitle={'Latest Trails'} />
    </View>
  )
}

export default ExploreScreen

const styles = StyleSheet.create({})