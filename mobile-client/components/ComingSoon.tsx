import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../contexts/ThemeProvider';

type ComingSoonProps = {
  title?: string;
  message?: string;
  detail?: string;
};

const ComingSoon = ({
  title = 'Coming soon',
  message = 'This part of Trail Tasks is not ready for the MVP yet.',
  detail = 'For now, keep using the solo hiking session flow while this feature gets designed and tested.',
}: ComingSoonProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.screen} testID="coming-soon-screen">
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Not in this MVP</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 20,
      borderWidth: 1,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    eyebrow: {
      color: theme.button,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 1,
      marginBottom: 10,
      textTransform: 'uppercase',
    },
    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 12,
    },
    message: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '600',
      lineHeight: 24,
      marginBottom: 12,
    },
    detail: {
      color: theme.secondaryText,
      fontSize: 15,
      lineHeight: 22,
    },
  });

export default ComingSoon;
