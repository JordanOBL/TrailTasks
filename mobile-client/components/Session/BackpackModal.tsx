import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import EnhancedAddonListItem from "../AddOnStore/AddonListItem";
import { SessionCfg } from "../../types/session";
import { Addon, User } from "../../watermelon/models";

interface backpackModalProps {
  isVisible: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  sessionCfg: SessionCfg;
  setSessionCfg: React.Dispatch<React.SetStateAction<SessionCfg>>;
  user: User;
  usersAddons: Addon[];
}

const BackpackModal = ({
  isVisible,
  onClose,
  sessionCfg,
  setSessionCfg,
  user,
  usersAddons,
}: backpackModalProps) => {
  const selectAddon = (addon: Addon | null) => {
    const position = sessionCfg.backpack.findIndex(slot => slot.addon === null);

    if (addon && sessionCfg.backpack.some(slot => slot.addon?.id === addon.id)) {
      Alert.alert("Addon already in backpack", "Addons do not stack.");
      return;
    }

    if (position >= 0) {
      const updatedBackpack = [...sessionCfg.backpack];
      updatedBackpack[position].addon = addon;
      setSessionCfg({ ...sessionCfg, backpack: updatedBackpack });
    }
  };

  const removeAddon = (index: number) => {
    const newCfg = { ...sessionCfg };
    newCfg.backpack[index].addon = null;
    setSessionCfg(newCfg);
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Manage Backpack</Text>

          <View style={styles.backpackContainer}>
            {sessionCfg.backpack.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.backpackSlot,
                  {
                    borderColor:
                      user.totalMiles < slot.minimumTotalMiles
                        ? "grey"
                        : slot.addon
                        ? "rgb(235, 33, 26)"
                        : "rgb(7,254,213)",
                    backgroundColor: slot.addon ? "rgb(180, 18, 12)" : "transparent",
                  },
                ]}
                onPress={() => {
                  const addon = sessionCfg.backpack[index].addon;
                  if (addon) {
                    //removes existing
                    removeAddon(index);
                  }
                }}>
                <Text
                  style={[
                    styles.slotText,
                    {
                      color: user.totalMiles >= slot.minimumTotalMiles ? "white" : "grey",
                    },
                  ]}>
                  {slot.addon?.name ||
                    (user.totalMiles >= slot.minimumTotalMiles
                      ? "+"
                      : `${index > 1 && !user.isProMember ? "Pro\n" : ""}Unlock at ${
                          slot.minimumTotalMiles
                        }`)}
                </Text>
                {}
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.listTitle}>Purchased Addons</Text>

          <ScrollView style={styles.addonList}>
            {usersAddons.length > 0 ? (
              usersAddons.map((userAddon, index) => (
                <EnhancedAddonListItem
                  key={index}
                  userAddon={userAddon}
                  selectAddon={selectAddon}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Inventory empty. Visit the shop to buy addons!</Text>
            )}
          </ScrollView>

          <Pressable style={styles.closeButton} onPress={() => onClose(false)}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default BackpackModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "rgb(28, 29, 31)",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(213, 243, 238)",
    marginBottom: 20,
  },
  backpackContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%",
  },
  backpackSlot: {
    width: "45%",
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  slotText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  addonList: {
    width: "100%",
    maxHeight: "50%",
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "grey",
    textAlign: "center",
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgb(7,254,213)",
    borderRadius: 8,
  },
  buttonText: {
    color: "rgb(28,29,31)",
    fontSize: 16,
    fontWeight: "bold",
  },
});
