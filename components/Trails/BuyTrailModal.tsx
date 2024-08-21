import React, {useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {Trail} from '../../watermelon/models';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  trail: Trail | null;
  trailTokens: number;
  onBuyTrail: (trail: Trail, cost: number) => void;
}

const BuyTrailModal = ({
  isVisible,
  onClose,
  trail,
  trailTokens,
  onBuyTrail,
}: Props) => {
  const [error, setError] = useState('');

  const handleBuyTrail = () => {
    const unlockCost =
      trail?.trailDistance < 5
        ? 5
        : trail?.trailDistance < 10
        ? 35
        : trail?.trailDistance < 20
        ? 50
        : 100;
    console.debug({trailTokens});
    if (trailTokens >= unlockCost) {
      onBuyTrail(trail!, unlockCost);
      onClose();
    } else {
      setError('Not enough trail tokens to buy this trail.');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Buy Trail</Text>
          <Text style={styles.descriptionText}>
            Are you sure you want to buy the "{trail?.trailName}" trail?
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.buttonsContainer}>
            <Pressable
              style={[styles.button, styles.buttonCancel]}
              onPress={() => {
                onClose();
                setError('');
              }}>
              <Text style={styles.textStyle}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonBuy]}
              onPress={handleBuyTrail}>
              <Text style={styles.textStyle}>Buy</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  descriptionText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: '40%',
  },
  buttonCancel: {
    backgroundColor: 'grey',
  },
  buttonBuy: {
    backgroundColor: 'green',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BuyTrailModal;
