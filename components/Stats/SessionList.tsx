import { FlatList, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Session_Category } from '../../watermelon/models';
import formatTime from '../../helpers/formatTime';
import { useTheme } from '../../contexts/ThemeProvider';

interface Props {
  filteredUserSessions: any[];
  sessionCategories: Session_Category[];
}

const SessionList = ({ filteredUserSessions }: Props) => {
  const { theme } = useTheme();

  const styles = getStyles(theme);

  const renderSessionItem = ({ item }: any) => (
    <View style={styles.sessionContainer} testID={`session-list-item-${item.id}`}>
      <Text style={styles.title}>{item.session_name}</Text>
      <Text style={styles.category}>Category: {item.session_category_name}</Text>
      {item.session_description && (
        <Text style={styles.description}>Description: {item.session_description}</Text>
      )}
      <Text style={styles.date}>Date: {item.date_added}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.info}>Miles: {item.total_distance_hiked} mi.</Text>
        <Text style={styles.info}>Time: {formatTime(item.total_session_time)}</Text>
      </View>
    </View>
  );

  if (filteredUserSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No sessions found in this time period or category.</Text>
      </View>
    );
  }

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

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingVertical: 20,
      paddingHorizontal: 16,
      backgroundColor: theme.background,
    },
    sessionContainer: {
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
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
      color: theme.secondaryText,
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      fontStyle: 'italic',
      color: theme.secondaryText,
      marginBottom: 4,
    },
    date: {
      fontSize: 13,
      color: theme.secondaryText,
      marginBottom: 8,
    },
    infoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 8,
      marginTop: 4,
    },
    info: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: theme.background,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.secondaryText,
      textAlign: 'center',
    },
  });

