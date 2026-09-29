import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Q } from "@nozbe/watermelondb";
import { Park, Park_Wild, User_Park, User_Wild, Wild } from "../watermelon/models";
import React, { useCallback, useState } from "react";
import { darkTheme, lightTheme } from "../theme";

import ParkCard from "../components/Parks/ParkCard";
import WildAvatar from "../components/Wilds/WildAvatar";
import formatTime from "../helpers/formatTime";
import { useAuthContext } from "../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeProvider";

interface Props {
  navigation: any;
}
type theme = typeof lightTheme | typeof darkTheme;
interface ParkCardData {
  parkName: string;
  parkId: string;
  isParkPassCompleted: boolean;
  isWildUnlocked: boolean;
  wildId: string;
}

interface CompletedSessionData {
  id: string;
  sessionName: string;
  sessionDescription?: string;
  sessionCategoryName?: string;
  totalSessionTime: number;
  totalDistanceHiked: string | number;
  dateAdded?: string;
}

const LogbookScreen = ({ navigation }: Props) => {
  const { user } = useAuthContext();
  const { theme } = useTheme();
  const db = useDatabase();

  const [parksWilds, setParksWilds] = useState<Park_Wild[]>([]);
  const [parks, setParks] = useState<Park[]>([]);
  const [userParks, setUserParks] = useState<User_Park[] | null>(null);
  const [userWilds, setUserWilds] = useState<User_Wild[] | null>(null);
  const [completedSessions, setCompletedSessions] = useState<CompletedSessionData[] | null>(null);
  const [activeWild, setActiveWild] = useState<Wild | null>(null);
  const [activeUserWild, setActiveUserWild] = useState<User_Wild | null>(null);
  const styles = getStyles(theme);

  const load = useCallback(async () => {
    if (!user) return;
    const [parksWilds, parks, userParks, userWilds, userSessions] = await Promise.all([
      db.get<Park_Wild>("parks_wilds").query().fetch(),
      db.get<Park>("parks").query().fetch(),
      user?.usersParks,
      user?.usersWilds,
      user?.usersSessions,
    ]);

    if (userWilds.length > 0) {
      console.log("User wilds loaded:", userWilds);
      const [activeUserWild] = userWilds.filter((uw: User_Wild) => uw.isActive == true);
      console.log("Active user wild:", activeUserWild);
      const [activeWild]: Wild[] = await db
        .get<Wild>("wilds")
        .query(Q.where("id", activeUserWild?.wildId || ""))
        .fetch();
      console.log("Active wild details:", activeWild);
      setActiveWild(activeWild || null);
      setActiveUserWild(activeUserWild ?? null);
    }

    setParksWilds(parksWilds);
    setParks(parks);
    setUserParks(userParks);
    setUserWilds(userWilds);
    setCompletedSessions(normalizeCompletedSessions(userSessions ?? []));
  }, [db, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const wildToParkId = React.useMemo(() => {
    const map: Record<string, string> = {};
    parksWilds.forEach(pw => {
      map[pw.wildId] = pw.parkId;
    });
    return map;
  }, [parksWilds]);

  const parkCardData: ParkCardData[] = React.useMemo(() => {
    return parksWilds.map(pw => {
      return {
        parkId: pw.parkId,
        parkName: parks.find(p => p.id === pw.parkId)?.parkName || "",
        isParkPassCompleted: userParks?.some(up => up.parkId === pw.parkId) ?? false,
        isWildUnlocked: userWilds?.some(uw => uw.wildId === pw.wildId) ?? false,
        wildId: pw.wildId,
      };
    });
  }, [parksWilds, parks, userParks, userWilds]);

  const renderParkCard = useCallback(
    ({ item }: { item: ParkCardData }) => (
      <ParkCard
        key={item.parkId}
        test-id={`park-pass-${item.parkId}`}
        parkId={item.parkId}
        parkName={item.parkName}
        isParkPassCompleted={item.isParkPassCompleted}
        isWildUnlocked={item.isWildUnlocked}
        wildId={item.wildId}
        user={user}
        navigation={navigation}
      />
    ),
    [user, navigation],
  );

  if (
    !user ||
    !parksWilds ||
    !parks ||
    userParks === null ||
    userWilds === null ||
    completedSessions === null
  ) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View
      testID="park-pass-screen"
      style={[styles.container, { backgroundColor: theme.background }]}>
      <Text testID="park-pass-count" style={[styles.completedPasses, { color: theme.text }]}>
        {userParks.length} / {parks.length}
      </Text>

      <ActiveWildBanner
        userWild={activeUserWild}
        wild={activeWild}
        parkId={activeWild ? wildToParkId[activeWild.id] : undefined}
        onPress={() => {
          if (!activeWild) return;
          const parkId = wildToParkId[activeWild.id];
          if (parkId) navigation.navigate("ParkDetails", { wildId: activeWild.id, parkId });
        }}
      />
      <FlatList
        data={parkCardData}
        ListHeaderComponent={<CompletedSessionsSection sessions={completedSessions} />}
        keyExtractor={item => item.parkId}
        numColumns={2}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        renderItem={renderParkCard}
      />
    </View>
  );
};

const normalizeCompletedSessions = (sessions: any[]): CompletedSessionData[] => {
  return sessions
    .map(session => ({
      id: session.id,
      sessionName: session.sessionName ?? session.session_name ?? "Untitled session",
      sessionDescription: session.sessionDescription ?? session.session_description,
      sessionCategoryName:
        session.sessionCategoryName ?? session.session_category_name ?? "Solo session",
      totalSessionTime: Number(session.totalSessionTime ?? session.total_session_time ?? 0),
      totalDistanceHiked: session.totalDistanceHiked ?? session.total_distance_hiked ?? "0.00",
      dateAdded: session.dateAdded ?? session.date_added,
    }))
    .sort((a, b) => String(b.dateAdded ?? "").localeCompare(String(a.dateAdded ?? "")));
};

const CompletedSessionsSection = ({ sessions }: { sessions: CompletedSessionData[] }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View testID="completed-sessions-section" style={styles.completedSessionsSection}>
      <Text style={styles.sectionTitle}>Completed Sessions</Text>
      {sessions.length === 0 ? (
        <View testID="completed-sessions-empty-state" style={styles.completedSessionEmptyCard}>
          <Text style={styles.completedSessionEmptyTitle}>No completed sessions yet</Text>
          <Text style={styles.completedSessionEmptyText}>
            Finish a solo hike and it will show up here with distance, time, and category.
          </Text>
        </View>
      ) : (
        sessions.map(session => (
          <View
            key={session.id}
            testID={`logbook-session-${session.id}`}
            style={styles.completedSessionCard}>
            <Text style={styles.completedSessionTitle}>{session.sessionName}</Text>
            <Text style={styles.completedSessionCategory}>{session.sessionCategoryName}</Text>
            {!!session.sessionDescription && (
              <Text style={styles.completedSessionDescription}>{session.sessionDescription}</Text>
            )}
            {!!session.dateAdded && (
              <Text style={styles.completedSessionDate}>{session.dateAdded}</Text>
            )}
            <View style={styles.completedSessionStatsRow}>
              <Text style={styles.completedSessionStat}>{session.totalDistanceHiked} mi</Text>
              <Text style={styles.completedSessionStat}>
                {formatTime(session.totalSessionTime)}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

export default LogbookScreen;

const ActiveWildBanner = ({
  userWild,
  wild,
  parkId,
  onPress,
}: {
  userWild: User_Wild | null;
  wild: Wild | null;
  parkId?: string;
  onPress: () => void;
}) => {
  const { theme } = useTheme();

  if (!wild || !parkId || !userWild) {
    return (
      <View
        style={{
          marginBottom: 12,
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: theme.background,
        }}>
        <Text style={{ color: theme.text, opacity: 0.7 }}>No active wild</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
      style={{
        marginBottom: 12,
        paddingHorizontal: 12,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.background,
        borderWidth: 1,
        borderColor: "rgba(7,254,213,0.35)", // subtle accent
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
      testID="active-wild-banner">
      <WildAvatar id={wild.id} pose="still" size={36} />

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text numberOfLines={1} style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>
          {wild.wildName ?? wild.id}
        </Text>
        <Text numberOfLines={1} style={{ color: theme.text, opacity: 0.7, fontSize: 12 }}>
          {wild.species ?? "Wild"} • Level {userWild.level ?? 1}
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          height: 24,
          borderRadius: 999,
          backgroundColor: "rgba(7,254,213,0.12)",
          borderWidth: 1,
          borderColor: "rgba(7,254,213,0.45)",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Text style={{ color: "rgb(7,254,213)", fontWeight: "700", fontSize: 11 }}>ACTIVE</Text>
      </View>
    </Pressable>
  );
};

const getStyles = (theme: theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background, // soft green-gray background
      padding: 16,
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      color: "white",
      marginBottom: 20,
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    completedPasses: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      padding: 16,
      color: "white",
    },
    completedSessionsSection: {
      marginBottom: 18,
      gap: 10,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "700",
    },
    completedSessionCard: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card ?? theme.background,
      marginBottom: 10,
    },
    completedSessionTitle: {
      color: "rgb(7,254,213)",
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 4,
    },
    completedSessionCategory: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 4,
    },
    completedSessionDescription: {
      color: theme.secondaryText,
      fontSize: 13,
      marginBottom: 4,
    },
    completedSessionDate: {
      color: theme.secondaryText,
      fontSize: 12,
      marginBottom: 8,
    },
    completedSessionStatsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingTop: 8,
    },
    completedSessionStat: {
      color: theme.text,
      fontSize: 13,
      fontWeight: "600",
    },
    completedSessionEmptyCard: {
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card ?? theme.background,
    },
    completedSessionEmptyTitle: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 4,
    },
    completedSessionEmptyText: {
      color: theme.secondaryText,
      fontSize: 13,
    },
    listContent: {
      alignItems: "center", // Centers the grid content
      justifyContent: "center",
    },
    prestigeButton: {
      marginTop: 8,
      borderRadius: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: "#344E41",
    },
    subtitle: {
      fontSize: 14,
      color: "#6C757D",
      marginTop: 4,
    },
  });
};
