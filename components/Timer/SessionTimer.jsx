import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import  formatCountdown  from '../../helpers/Timer/formatCountdown';
import Timer from '../../types/timer';
import {checkTimerIsZero, checkPaceIncrease} from '../../helpers/Timer/timerFlow';

interface Props {
    timer: Timer;
    setTimer: React.Dispatch<React.SetStateAction<Timer>>;
    minimumPace: number;
    maximumPace: number;
    paceIncreaseInterval: number;
    paceIncreaseValue: number;
}

const SessionTimer = ({ timer, setTimer, minimumPace, maximumPace, paceIncreaseInterval, paceIncreaseValue }: Props) => {
    const countdown = formatCountdown(timer.time);

    useEffect(() => {
        let timerInterval
        if (timer?.isRunning && !timer?.isPaused) {
            
            timerInterval = setInterval(() => {
                if(timer.time <= 0){
                    checkTimerIsZero({ timer, setTimer });

                }
                if(timer.time > 0 && !timer.isBreak) {
                    checkPaceIncrease({ timer, setTimer, minimumPace, maximumPace, paceIncreaseInterval, paceIncreaseValue });
                }

                setTimer(prev => ({...prev,time: prev.time - 1}));
            }, 1000);
        }

        // Clear the interval when the component unmounts or dependencies change
        return () => clearInterval(timerInterval);

    }, [timer.time, timer.isRunning, timer.isPaused, minimumPace, maximumPace, paceIncreaseInterval, paceIncreaseValue]);

    console.log(timer.time);
    return (
        <View style={styles.timerContainer}>
            <Text
                style={[
                    styles.timerText,
                    ( timer.isPaused || timer.isBreak  )&& styles.pausedText,
                ]}>
                {timer.isPaused ? 'Paused' : countdown}
            </Text>
        </View>
    );
};


export default SessionTimer;
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
