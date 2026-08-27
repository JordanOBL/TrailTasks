import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import React from "react";
import { User, User_Wild } from "../watermelon/models";
import WildAvatar from "../components/Wilds/WildAvatar";

interface Props {
  navigation: any;
  user: User;
  activeWilds?: User_Wild[];
}

const SessionTypeScreen = ({ navigation, user, activeWilds = [] }: Props) => {
  const [selection, setSelection] = React.useState("solo");

  const currentWild = activeWilds[0]?.wildId ?? "scout";

  async function toggleSwitch() {
    setSelection(previousState => (previousState === "solo" ? "group" : "solo"));
  }
  async function handleSelection() {
    //if (isProMember) {
    if (selection === "solo") {
      navigation.navigate("Solo", { user });
    } else {
      navigation.navigate("Group", { user });
    }
    // } else {
    //   if (selection === "solo") {
    //     navigation.navigate("Solo");
    //   } else {
    //     navigation.navigate("Basecamp", { screen: "Subscribe" });
    //   }
    // }
  }
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}>
      <View style={{ width: "100%", alignItems: "center" }}>
        <View style={{ width: "100%", alignItems: "center" }}>
          {selection === "solo" ? (
            <WildAvatar id={currentWild} pose="wave" size={200} animated />
          ) : (
            /* <Rive
              ref={riveRef}
     resourceName={currentWild}
      artboardName="Artboard"
      stateMachineName="State Machine 1"
      style={{width: 250, height: 250}}
  />*/
            <View style={styles.groupWildsContainer}>
              <WildAvatar key={0} id={"ember"} pose="wave" size={120} animated />
              <WildAvatar key={2} id={currentWild} pose="still" size={120} animated />
              <WildAvatar id={"scout"} pose="wave" size={120} animated />
            </View>
          )}
        </View>
        <View style={styles.switchContainer}>
          <Text
            style={[
              styles.switchLabel,
              { color: selection === "solo" ? "rgb(7,254,213)" : "white" },
            ]}>
            Solo
          </Text>
          <Switch
            trackColor={{ false: "white", true: "white" }}
            thumbColor={"rgb(7,254,213)"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={!(selection === "solo")}
          />
          <Text
            style={[
              styles.switchLabel,
              { color: selection === "group" ? "rgb(7,254,213) " : "white" },
            ]}>
            Group
          </Text>
        </View>
      </View>
      <Pressable onPress={handleSelection} style={styles.goButton}>
        <Text style={styles.goButtonText}>GO!</Text>
      </Pressable>
    </View>
  );
};

const enhance = withObservables(["user"], ({ user }: Props) => ({
  activeWilds: user.usersWilds.extend(Q.where("is_active", true), Q.take(1)).observe(),
}));

const EnhancedSessionTypeScreen = enhance(SessionTypeScreen);

export { SessionTypeScreen };
export default EnhancedSessionTypeScreen;

const styles = StyleSheet.create({
  goButton: {
    marginTop: 10,
    backgroundColor: "rgb(7,254,213)",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    width: "75%",
  },

  goButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  groupWildsContainer: {
    flexDirection: "row",
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    width: "50%",
    padding: 4,
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  switchLabel: {
    fontWeight: "bold",
    fontSize: 24,
  },
});
