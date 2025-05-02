import {FlatList, StyleSheet, Text, View} from 'react-native';

import React from 'react';
import {Session_Category} from '../../watermelon/models';
import formatTime from '../../helpers/formatTime';

interface Props {
  filteredUserSessions: any[];
  sessionCategories: Session_Category[];
}

const SessionList = ({filteredUserSessions}: Props) => {
  // @ts-ignore
  const renderSessionItem = ({item}) => (
    <View style={styles.sessionContainer} testID={`session-list-item-${item.id}`}>
      <Text style={styles.title}>{item.session_name}</Text>
      <Text style={styles.category}>
        Category: {item.session_category_name}
      </Text>
      {item.sessionDescription && (
        <Text style={styles.description}>
          Description: {item.session_description}
        </Text>
      )}
      <Text style={styles.date}>Date: {item.date_added}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>Miles: {item.total_distance_hiked} mi.</Text>
        <Text style={styles.info}>
          Time: {formatTime(item.total_session_time)}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      testID="sessions-list"
      data={filteredUserSessions}
      renderItem={renderSessionItem}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

export default SessionList;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgb(18, 19, 21)',
  },
  sessionContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgb(31, 33, 35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgb(7, 254, 213)',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(221, 224, 226, 0.85)',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(221, 224, 226, 0.75)',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: 'rgba(221, 224, 226, 0.6)',
    marginBottom: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
    marginTop: 4,
  },
  info: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgb(221, 224, 226)',
  },
});

