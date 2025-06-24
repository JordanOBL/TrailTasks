const zombieRightImages = [
	require('../../assets/Files/png/1/front/Idle1-2.png'),
	require('../../assets/Files/png/1/front/Idle1-1.png'),
	require('../../assets/Files/png/1/front/Idle1-3.png'),
	require('../../assets/Files/png/1/front/Idle1-4.png'),
	require('../../assets/Files/png/1/front/Idle2-1.png'),
	require('../../assets/Files/png/1/front/Idle2-2.png'),
	require('../../assets/Files/png/1/front/Idle2-3.png'),
	require('../../assets/Files/png/1/front/Idle2-4.png'),
	require('../../assets/Files/png/1/right/Walk1-1.png'),
	require('../../assets/Files/png/1/right/Walk1-2.png'),
	require('../../assets/Files/png/1/right/Walk1-3.png'),
	require('../../assets/Files/png/1/right/Walk1-4.png'),
	require('../../assets/Files/png/1/right/Walk2-1.png'),
	require('../../assets/Files/png/1/right/Walk2-2.png'),
	require('../../assets/Files/png/1/right/Walk2-3.png'),
	require('../../assets/Files/png/1/right/Walk2-4.png'),
	require('../../assets/Files/png/1/right/Dead1.png'),
	require('../../assets/Files/png/1/right/Dead2.png'),
	require('../../assets/Files/png/1/right/Dead3.png'),
	require('../../assets/Files/png/1/right/Dead4.png'),
	require('../../assets/Files/png/1/right/Attack1.png'),
	require('../../assets/Files/png/1/right/Attack2.png'),
	require('../../assets/Files/png/1/right/Attack3.png'),
	require('../../assets/Files/png/1/right/Attack4.png'),
	require('../../assets/Files/png/1/right/Attack5.png'),
];
import React, { useState } from 'react';
import {
	Animated,
	Image,
	StyleSheet,
	View,
	ImageBackground,
} from 'react-native';

interface Props {
	action: string;
}

export const ZombieWalkingAnimation = ({ action }: Props) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(8);

	React.useEffect(() => {
		let intervalId: string | number | NodeJS.Timeout | undefined;
		if (!action) return;

		if (action === 'WALK') {
			intervalId = setInterval(() => {
				setCurrentImageIndex((prevIndex) =>
					prevIndex === 15 ? 8 : prevIndex + 1
				);
			}, 400);
		}

		return () => clearInterval(intervalId);
	}, []);

	return (
		<View
			style={{
				flex: 1,
				alignItems: 'flex-start',
				justifyContent: 'flex-end',
				
			}}>
			<Image
				source={zombieRightImages[currentImageIndex]}
				style={{
					width: 110,
					height: 110,
				}}
			/>
		</View>
	);
};

export const ZombieIdleAnimation = ({ action }: Props) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	React.useEffect(() => {
		let intervalId: string | number | NodeJS.Timeout | undefined;
		if (!action) return;

		if (action === 'IDLE') {
			intervalId = setInterval(() => {
				setCurrentImageIndex((prevIndex) =>
					prevIndex === 7 ? 0 : prevIndex + 1
				);
			}, 400);
		}

		return () => clearInterval(intervalId);
	}, []);

	return (
		<View
			style={{
				flex: 1,
				alignItems: 'flex-start',
				justifyContent: 'flex-end',
				backgroundColor: 'rgba(15,15,15,.3)',
			}}>
			<Image
				source={zombieRightImages[currentImageIndex]}
				style={{ width: 150, height: 150 }}
			/>
		</View>
	);
};

export const ZombieDeadAnimation = ({ action }: Props) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(16);

	React.useEffect(() => {
		let intervalId: string | number | NodeJS.Timeout | undefined;
		if (!action) return;

		if (action === 'DEAD') {
			intervalId = setInterval(() => {
				setCurrentImageIndex((prevIndex) =>
					prevIndex === 19 ? 16 : prevIndex + 1
				);
			}, 400);
		}

		return () => clearInterval(intervalId);
	}, []);

	return (
		<View
			style={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				marginVertical: 20,
				backgroundColor: 'rgba(15,15,15,.5)',
			}}>
			<Image
				source={zombieRightImages[currentImageIndex]}
				style={{ width: 125, height: 125 }}
			/>
		</View>
	);
};
