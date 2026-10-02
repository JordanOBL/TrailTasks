import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import React from 'react';

type XpRingProps = {
  size?: number;
  strokeWidth?: number;
  xp: number;
  xpToLevel: number;
  ringColor?: string;
  children: React.ReactNode;   // image / Rive goes here
};

const XpRing: React.FC<XpRingProps> = ({
  size = 140,
  strokeWidth = 8,
  xp,
  xpToLevel,
  ringColor,
  children,
}) => {
  // clamp 0–1
  const progress = Math.max(0, Math.min(1, xpToLevel === 0 ? 0 : xp / xpToLevel));

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // this controls how much of the circle is visible
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  const innerSize = size - strokeWidth * 4;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#043436"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* progress ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor ?? "#00F6FF"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          // instead of rotation/originX/originY:
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* avatar container – still circular */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default XpRing;
