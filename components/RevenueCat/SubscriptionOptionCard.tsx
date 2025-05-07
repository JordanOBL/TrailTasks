import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';

const SubscriptionOptionCard = ({ product, isPopular, onPress, selected }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme, selected);


  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {isPopular && (
        <View style={styles.popularTag}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      <Text style={styles.title}>{product.title.split('–, --, ')[0].trim()}</Text>
      <Text style={styles.price}>
        {product.priceString} / {product.subscriptionPeriod === 'P1M' ? 'month' : 'year'}
      </Text>
      <Text style={styles.subText}>
        Billed {product.subscriptionPeriod === 'P1Y' ? 'annually' : 'monthly'}
      </Text>
    </TouchableOpacity>
  );
};

const getStyles = (theme, selected) =>
  StyleSheet.create({
    card: {
      backgroundColor: selected ? theme.button : theme.card,
      padding: 20,
      borderRadius: 20,
      marginVertical: 10,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: selected ? 6 : 3,
      borderColor: selected ? theme.button : theme.border,
      borderWidth: selected ? 2 : 1,
      width: '100%',
    },
    popularTag: {
      backgroundColor: selected ? theme.card : theme.button,
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 6,
    },
    popularText: {
      color: selected ? theme.button : theme.background,
      fontWeight: 'bold',
      fontSize: 12,
    },
    title: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
    },
    price: {
      color: selected ? theme.background : theme.button,
      fontSize: 16,
      fontWeight: '500',
    },
    subText: {
      color: theme.secondaryText,
      fontSize: 12,
      marginTop: 4,
    },
  });

export default SubscriptionOptionCard;

