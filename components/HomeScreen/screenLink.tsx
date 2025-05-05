import React from 'react';
import { Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { User } from '../../watermelon/models';
import { useTheme } from '../../contexts/ThemeProvider';

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

  const isLocked = needsActiveSubscription && !hasActiveSubscription;
  const isPro = needsActiveSubscription && !hasActiveSubscription;

  const handlePress = () => {
    if (!needsActiveSubscription || hasActiveSubscription) {
      navigation.navigate(navTo);
    } else {
      navigation.navigate('Subscribe');
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
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'left',
    },
    LinkContainer: {
      borderColor: theme.linkBorder,
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: theme.linkBackground,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 10,
      padding: 20,
      flexDirection: 'row',
    },
  });

