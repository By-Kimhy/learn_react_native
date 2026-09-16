import { useState } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

/**
 * Animating the Pressable itself (rather than an inner wrapper) matters: layout
 * props such as `flex` on `style` have to land on the node the parent lays out,
 * or flexed rows of buttons collapse to their content width.
 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** How far to shrink on press. Bigger targets want a subtler value. */
  scaleTo?: number;
}

/** A press that gives physical feedback without a ripple or a colour flash. */
export function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  // Lazy state rather than a ref: the value is read during render (to build
  // the transform), which refs are not meant for.
  const [scale] = useState(() => new Animated.Value(1));

  const animateTo = (value: number) =>
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  return (
    <AnimatedPressable
      onPressIn={(event) => {
        animateTo(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }] }]}
      {...rest}
    />
  );
}
