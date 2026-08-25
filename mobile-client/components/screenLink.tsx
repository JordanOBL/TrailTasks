import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { User } from '../watermelon/models';
import { darkTheme, lightTheme } from '../theme';
import { useTheme } from '../contexts/ThemeProvider';

interface Props {
  children: any;
  navTo: string;
  navigation: any;
  user: User;
  hasActiveSubscription: boolean;
  needsActiveSubscription: boolean;
}

const ScreenLink = ({
  children,
  navigation,
  navTo,
  user,
  hasActiveSubscription,
  needsActiveSubscription,
}: Props) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const isLocked = needsActiveSubscription;
  const isPro = hasActiveSubscription;

  const handlePress = () => {
    if (!isLocked || isPro) {
      navigation.navigate(navTo);
    } else {
      navigation.navigate('Basecamp', { screen: 'Subscribe' });
    }
  };

  return (
    <TouchableOpacity style={styles.LinkContainer} onPress={handlePress}>
      <Text
        style={[
          styles.H2,
          { color: isLocked ? theme.linkDisabled : theme.linkText },
        ]}>
        {isLocked && (
          <Icon name="lock-closed" size={18} color={theme.linkDisabled} />
        )}
        {' ' + children}
        {isPro ? ' - Pro ' : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default ScreenLink;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    H2: {
      fontSize: 16,
      fontWeight: '700',
    },
    LinkContainer: {
      borderColor: theme.linkBorder,
      borderRadius: 10,
      backgroundColor: theme.linkBackground,
      justifyContent: 'flex-start',
      marginBottom: 10,
      padding: 20,
      flexDirection: 'row',
    },
  });

