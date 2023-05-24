// import React, { useRef, useEffect } from 'react';
// import { Animated, Dimensions, StyleSheet, View, Image } from 'react-native';

// const { width } = Dimensions.get('window');

// const BackgroundAnimation = () => {
// 	const translateX = useRef(new Animated.Value(0)).current;

// 	useEffect(() => {
// 		Animated.loop(
// 			Animated.timing(translateX, {
// 				toValue: -width,
// 				duration: 10000,
// 				useNativeDriver: true,
// 			})
// 		).start();
// 	}, []);

// 	return (
// 		<Animated.Image
//       style={[styles.background, { transform: [{ translateX }] }]}
//       source={require('../../assets/vecteezy_vector-mountains-forest-background-texture-silhouette-of_11134245.jpg')}
// 		/>
// 	);
// };

// const styles = StyleSheet.create({
// 	background: {
// 		position: 'absolute',
// 		top: 0,
// 		left: 0,
// 		width: width * 2,
// 		height: '100%',
// 		backgroundColor: 'blue',
// 	},
// });

// export default BackgroundAnimation;
import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View, Image } from 'react-native';

const { width } = Dimensions.get('window');

const InfiniteBackground = () => {
	const translateX = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		const animation = Animated.loop(
			Animated.timing(translateX, {
				toValue: -width,
				duration: 15000,
				useNativeDriver: true,
				easing: (t) => t,
			})
    );
  
		animation.start();
		return () => animation.stop();
	}, []);

	return (
		<View style={styles.container}>
			<Animated.Image
				style={[styles.background, { transform: [{ translateX }],opacity: .4 }]}
				source={
					require('../../assets/vecteezy_vector-mountains-forest-background-texture-silhouette-of_11134245.jpg')
				}
        
			/>
		</View>
	);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
		width: '100%',
		height: '100%',
		overflow: 'hidden',
		position: 'absolute',
	},
	background: {
    position: 'absolute',
    
		bottom: 100,
		left: 0,
		width: 1920,
		height: '100%',
	},
});

export default InfiniteBackground;
