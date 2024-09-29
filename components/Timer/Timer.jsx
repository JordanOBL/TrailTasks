import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '../../helpers/formatTime';
import TimerDetails from '../../types/timerdetails';

interface Props {
    timerDetails: TimerDetails;
    setTimerDetails: React.Dispatch<React.SetStateAction<TimerDetails>>;
}

const Timer = ({ timerDetails, setTimerDetails }: Props) => {
    const countdown = formatTime(timerDetails.time);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (timerDetails.isRunning && !timerDetails.isPaused) {
            timer = setInterval(() => {
                setTimerDetails(prev => ({
                    ...prev,
                    time: prev.time - 1,
                }));
            }, 1000);
        }

        // Clear the interval when the component unmounts or dependencies change
        return () => clearInterval(timer);

    }, [timerDetails.isRunning, timerDetails.isPaused, setTimerDetails]);

    return (
        <View style={styles.timerContainer}>
            <Text
                style={[
                    styles.timerText,
                    timerDetails.isPaused && styles.pausedText,
                ]}>
                {timerDetails.isPaused ? 'Paused' : countdown}
            </Text>
        </View>
    );
};


export default Timer;
const styles = StyleSheet.create({
    timerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerText: {
        fontSize: 60,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
        color: 'rgb(7,254,213)',
    },
    pausedText: {
        color: 'rgb(217,49,7)',
    },
});
