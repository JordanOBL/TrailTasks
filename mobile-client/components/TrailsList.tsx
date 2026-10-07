import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  User,
  User_Completed_Trail,
  User_Purchased_Trail,
  User_Queued_Trail,
} from "../watermelon/models";
import { darkTheme, lightTheme } from "../theme";

import FullTrailDetails from "../types/fullTrailDetails";
import TrailCard from "./Trails/TrailCard";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../services/AuthContext";
import { useTheme } from "../contexts/ThemeProvider";

interface Props {
  trailsCollection: FullTrailDetails[];
  user: User;
  completedTrails: User_Completed_Trail[];
  queuedTrails: User_Queued_Trail[];
  userPurchasedTrails: User_Purchased_Trail[];
  queuedTrailMap: Record<string, boolean>;
}

const filterParams = [
  "All",
  "Available to Me",
  "Free This Month",
  "Sampler Trails",
  "Featured",
  "User Purchased",
  "Completed",
];

const TrailsList = ({
  trailsCollection,
  user,
  userPurchasedTrails,
  completedTrails,
  queuedTrailMap,
}: Props) => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<FlatList<FullTrailDetails>>(null);
  const { theme } = useTheme();
  const { isProMember } = useAuthContext();
  const navigation = useNavigation();
  const styles = getStyles(theme);

  const handleTrailPress = useCallback(
    (trail: FullTrailDetails): void => {
      // @ts-ignore
      navigation.navigate("TrailDetails", { fullTrail: trail, trailId: null });
    },
    [navigation],
  );

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredTrails = useMemo(() => {
    let filtered = trailsCollection;
    const purchasedTrailIds = new Set(userPurchasedTrails.map(purchasedTrail => purchasedTrail.trailId));
    const completedTrailIds = new Set(completedTrails.map(completedTrail => completedTrail.trailId));

    if (filter === "Available to Me") {
      filtered = isProMember
        ? trailsCollection
        : trailsCollection.filter(
            trail =>
              trail.is_free == true ||
              purchasedTrailIds.has(trail.id) ||
              completedTrailIds.has(trail.id) ||
              user?.trailId === trail.id,
          );
    } else if (filter === "User Purchased") {
      filtered = trailsCollection.filter(trail => purchasedTrailIds.has(trail.id));
    } else if (filter === "Free This Month") {
      filtered = trailsCollection.filter(trail => trail.is_free == true && trail.is_pro_only == true);
    } else if (filter === "Sampler Trails") {
      filtered = trailsCollection.filter(trail => trail.is_pro_only == false && trail.is_free != true);
    } else if (filter === "Featured") {
      filtered = trailsCollection.filter(trail => trail.trail_of_the_week == true);
    } else if (filter === "Completed") {
      filtered = trailsCollection.filter(trail => completedTrailIds.has(trail.id));
    }

    if (debouncedSearchQuery) {
      const normalizedQuery = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (trail: FullTrailDetails) =>
          trail.trail_name.toLowerCase().includes(normalizedQuery) ||
          trail.park_name.toLowerCase().includes(normalizedQuery) ||
          trail.state.toLowerCase().includes(normalizedQuery),
      );
    }

    return filtered;
  }, [
    completedTrails,
    debouncedSearchQuery,
    filter,
    isProMember,
    trailsCollection,
    user?.trailId,
    userPurchasedTrails,
  ]);

  const renderTrailItem = useCallback(
    ({ item }: { item: FullTrailDetails }) => (
      <TrailCard
        trail={item}
        key={item.id}
        isQueued={queuedTrailMap && item?.id in queuedTrailMap ? queuedTrailMap[item.id] : false}
        handleTrailPress={handleTrailPress}
      />
    ),
    [handleTrailPress, queuedTrailMap],
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.eyebrow}>Explore</Text>
      <Text style={styles.title}>Find your next trail</Text>
      <Text style={styles.subtitle}>
        Start with Scout, sample monthly bonus trails, and go Pro to unlock every park.
      </Text>

      <View style={styles.searchCard}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trails, parks, or states"
          placeholderTextColor={theme.secondaryText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filterParams}
        horizontal
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        renderItem={({ item }) => {
          const selected = item === filter;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => setFilter(item)}
              style={[styles.filterChip, selected && styles.filterChipSelected]}>
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {filteredTrails.length} {filteredTrails.length === 1 ? "trail" : "trails"}
        </Text>
        {filter !== "All" && <Text style={styles.resultFilter}>Filtered by {filter}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={filteredTrails}
        renderItem={renderTrailItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No trails found</Text>
            <Text style={styles.emptyText}>Try another search term or filter.</Text>
          </View>
        }
        contentContainerStyle={styles.trailsContainer}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        removeClippedSubviews={true}
        onScroll={event => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setShowScrollTop(offsetY > 700);
        }}
        scrollEventThrottle={16}
      />
      {showScrollTop && (
        <TouchableOpacity
          accessibilityLabel="Scroll to top"
          accessibilityRole="button"
          activeOpacity={0.86}
          onPress={scrollToTop}
          style={styles.scrollTopButton}>
          <Text style={styles.scrollTopText}>↑ Top</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TrailsList;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.exploreBackground,
    },
    trailsContainer: {
      paddingBottom: 28,
    },
    headerContainer: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 8,
    },
    eyebrow: {
      color: theme.button,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 1.2,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    title: {
      color: theme.text,
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: -0.4,
      lineHeight: 35,
    },
    subtitle: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      marginTop: 8,
      marginBottom: 16,
    },
    searchCard: {
      alignItems: "center",
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      paddingHorizontal: 14,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 3,
    },
    searchIcon: {
      color: theme.button,
      fontSize: 24,
      fontWeight: "900",
      marginRight: 8,
    },
    searchInput: {
      color: theme.inputText,
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
      paddingVertical: 13,
    },
    filtersRow: {
      gap: 10,
      paddingTop: 14,
      paddingBottom: 12,
    },
    filterChip: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    filterChipSelected: {
      backgroundColor: theme.button,
      borderColor: theme.button,
    },
    filterText: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "800",
    },
    filterTextSelected: {
      color: theme.buttonText,
    },
    resultRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 2,
    },
    resultText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "900",
    },
    resultFilter: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
    },
    emptyCard: {
      alignItems: "center",
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      marginHorizontal: 18,
      marginTop: 16,
      padding: 24,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
      marginBottom: 4,
    },
    emptyText: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
    },
    scrollTopButton: {
      alignItems: "center",
      backgroundColor: theme.button,
      borderRadius: 999,
      bottom: 22,
      elevation: 5,
      paddingHorizontal: 18,
      paddingVertical: 12,
      position: "absolute",
      right: 18,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
    },
    scrollTopText: {
      color: theme.buttonText,
      fontSize: 14,
      fontWeight: "900",
    },
  });
