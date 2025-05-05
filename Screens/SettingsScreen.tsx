import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import EnhancedSubscribeScreen from "./SubscribeScreen";
import { User } from '../watermelon/models';
import { sync } from '../watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useInternetConnection } from '../hooks/useInternetConnection';
import { useTheme } from '../contexts/ThemeProvider';
import { lightTheme, darkTheme } from '../theme';

interface Props {
  user: User;
}

const SettingsScreen = ({ user }: Props) => {
  const database = useDatabase();
  const { isConnected } = useInternetConnection();
  const { theme, toggleTheme } = useTheme();

  const currentThemeName = theme === darkTheme ? 'dark' : 'light';

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <EnhancedSubscribeScreen user={user} />

      <Pressable style={styles.button} onPress={() => sync(database, isConnected, user.id)}>
        <Text style={styles.buttonText}>Sync</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          Switch to {currentThemeName === 'dark' ? 'Light' : 'Dark'} Mode
        </Text>
      </Pressable>
    </View>
  );
};

export default SettingsScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.background,
    },
    button: {
      backgroundColor: theme.button,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: '600',
    },
  });

