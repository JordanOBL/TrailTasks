import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, {useMemo} from 'react';

import WildAvatar from '../../components/Wilds/WildAvatar'
import {useTheme} from '../../contexts/ThemeProvider';
import {withObservables} from '@nozbe/watermelondb/react';

const ParkDetails = ({park, wild, user,purchasedTrails, completedTrails, trails, userParks}) => {
    const {theme } = useTheme();
    const styles = getStyles(theme);
  // quick lookups
  const purchasedIds = useMemo(
    () => new Set(purchasedTrails.map((pt) => pt.trailId)),
    [purchasedTrails]
  );
  const completedIds = useMemo(
    () => new Set(completedTrails.map((ct) => ct.trailId)),
    [completedTrails]
  );

  const totalTrails = trails.length;
  const completedCount = useMemo(
    () => trails.filter((t) => completedIds.has(t.id)).length,
    [trails, completedIds]
  );
  const purchasedCount = useMemo(
    () => trails.filter((t) => purchasedIds.has(t.id)).length,
    [trails, purchasedIds]
  );
  const completionPct = totalTrails ? Math.round((completedCount / totalTrails) * 100) : 0;

const wildPose = useMemo(() => {
  console.log(wild, userParks, theme);

  const hasThisPark = userParks?.some((uw) => uw.wildId === wild.id);
  if (hasThisPark) return 'still';

  return theme.themeName === 'darkTheme'
    ? 'hidden_dark'
    : 'hidden_light';

}, [wild?.id, userParks, theme.themeName]);





  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header / Park Info */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.parkName}>{park.parkName}</Text>
            <View style={styles.tagRow}>
              {park.parkType ? <Tag theme={theme} label={park.parkType} /> : null}
              {park.climate ? <Tag theme={theme} label={park.climate} /> : null}
              {park.terrainType ? <Tag theme={theme} label={park.terrainType} /> : null}
            </View>
          </View>
          {!!park.parkImageUrl && (
            <Image source={{ uri: park.parkImageUrl }} style={styles.parkImage} resizeMode="cover" />
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat theme={theme} label="Trails" value={String(totalTrails)} />
          <Stat theme={theme} label="Completed" value={String(completedCount)} />
          <Stat theme={theme} label="Purchased" value={String(purchasedCount)} />
        </View>

        {/* Progress */}
        <View style={styles.progressWrap}>
          <Text style={styles.progressLabel}>Park Completion</Text>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
          </View>
          <Text style={styles.progressPct}>{completionPct}%</Text>
        </View>
      </View>

      
{/* Wild */}
<View style={styles.card}>
  <Text style={styles.sectionTitle}>Wild</Text>
  {wild ? (
    <View style={styles.wildRow}>
      <WildAvatar
        id={wild.id}
        pose={wildPose}
        size={150}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.wildName}>{wild.wildName}</Text>
        <View style={styles.tagRow}>
          {wild.species && userParks.includes(up => up.park_id === park.id) ? <Tag theme={theme} label={wild.species} /> : null}
          {wild.rarity ? <Tag theme={theme} label={`Rarity: ${wild.rarity}`} /> : null}
        </View>
      </View>
    </View>
  ) : (
    <EmptyLine theme={theme} text="No wild assigned to this park yet." />
  )}
</View>

      {/* Trails */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trails</Text>
        {trails.length === 0 ? (
          <EmptyLine theme={theme} text="No trails in this park yet." />
        ) : (
          <FlatList
            data={trails}
            keyExtractor={(t) => t.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item: trail }) => {
              const isCompleted = completedIds.has(trail.id);
              const isPurchased = purchasedIds.has(trail.id);

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.trailRow}
                  onPress={() => onPressTrail?.(trail)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trailName}>{trail.trailName}</Text>
                    <View style={styles.trailMetaRow}>
                      {trail.trailDistance ? <Meta theme={theme} label={`${trail.trailDistance} mi`} /> : null}
                      {trail.trailElevation ? <Meta theme={theme} label={`${trail.trailElevation} ft gain`} /> : null}
                      {trail.trailDifficulty ? <Meta theme={theme} label={trail.trailDifficulty} /> : null}
                      {trail.isFree ? <Meta theme={theme} label="Free" /> : null}
                      {trail.isSubscribersOnly ? <Meta theme={theme} label="Subscribers" /> : null}
                    </View>
                  </View>

                  <View style={styles.badgeCol}>
                    {isCompleted ? (
                      <Badge theme={theme} text="Completed" tone="success" />
                    ) : null}
                    {isPurchased ? (
                      <Badge theme={theme} text="Purchased" tone="primary" />
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};
/* ————— Small UI bits (theme-aware) ————— */

const Tag = ({ label, theme }) => (
  <View
    style={{
      backgroundColor:
        theme.themeName === 'darkTheme' ? theme.linkBackground : theme.linkBackground,
      borderColor: theme.linkBorder,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    }}
  >
    <Text
      style={{
        color: theme.linkText,
        fontSize: 12,
        fontWeight: '600',
      }}
    >
      {label}
    </Text>
  </View>
);

const Meta = ({ label, theme }) => (
  <View
    style={{
      backgroundColor:
        theme.themeName === 'darkTheme' ? theme.inputBackground : theme.card,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    }}
  >
    <Text
      style={{
        color:
          theme.themeName === 'darkTheme' ? theme.trailStatText : theme.trailStatText,
        fontSize: 12,
        fontWeight: '500',
      }}
    >
      {label}
    </Text>
  </View>
);

const Stat = ({ label, value, theme }) => (
  <View style={{ alignItems: 'center', flex: 1, paddingVertical: 8 }}>
    <Text
      style={{
        fontSize: 20,
        fontWeight: '700',
        color: theme.statValue,
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        marginTop: 2,
        fontSize: 12,
        color: theme.statLabel,
      }}
    >
      {label}
    </Text>
  </View>
);
//  {
//   text: string;
//   tone?: "primary" | "success" | "warning" | "neutral";
//   theme: Theme;}

const Badge = ({
  text,
  tone,
  theme,
}) => {
  let bg = theme.card;
  if (tone === 'success') {bg = theme.completedBadge;} // green from theme
  else if (tone === 'primary') {bg = theme.buttonPrimary;}
  else if (tone === 'warning') {bg = '#FBBF24';}
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color:
            tone === 'success'
              ? theme.completedBadgeText
              : theme.buttonPrimaryText,
        }}
      >
        {text}
      </Text>
    </View>
  );
};

const EmptyLine = ({ text, theme }) => (
  <Text
    style={{
      color: theme.secondaryText,
      fontStyle: 'italic',
      paddingVertical: 8,
    }}
  >
    {text}
  </Text>
);

/* ————— Styles ————— */

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      gap: 16,
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    headerRow: {
      flexDirection: 'row',
      gap: 12,
    },
    headerLeft: {
      flex: 1,
      gap: 8,
    },
    parkName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.trailHeaderText, // strong title color
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    parkImage: {
      width: 84,
      height: 84,
      borderRadius: 12,
      backgroundColor:
        theme.themeName === 'darkTheme' ? theme.inputBackground : theme.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    statsRow: {
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    progressWrap: {
      marginTop: 16,
    },
    progressLabel: {
      fontSize: 12,
      color: theme.secondaryText,
      marginBottom: 6,
    },
    progressBarOuter: {
      height: 10,
      backgroundColor: theme.progressBarBackground,
      borderRadius: 999,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.progressBorder,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.progressBar,
    },
    progressPct: {
      marginTop: 6,
      fontSize: 12,
      color: theme.progressText,
      fontWeight: '600',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.trailHeaderText,
      marginBottom: 10,
    },
    wildRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      justifyContent:'center'
    },
    wildName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 6,
    },
    trailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
    },
    trailName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    trailMetaRow: {
      marginTop: 6,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    badgeCol: {
      gap: 6,
      marginLeft: 12,
      alignItems: 'flex-end',
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      opacity: 0.6,
    },
  });


const enhance = withObservables(['user'], ({ user, park }) => ({
    user: user,
    trails: park.trails,
    completedTrails: user.usersCompletedTrails,
    purchasedTrails: user.usersPurchasedTrails,
    userParks: user.usersParks,


}));

const EnhancedParkDetails = enhance(ParkDetails);
export default EnhancedParkDetails;

const styles = StyleSheet.create({});
