import type { ReactNode } from 'react';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface SwipeAction {
  label: string;
  icon: IconName;
  background: string;
  tint: string;
  onPress: () => void;
  /** Destructive actions leave the row open so the removal reads as deliberate. */
  keepOpen?: boolean;
}

export interface SwipeRowProps {
  children: ReactNode;
  left?: SwipeAction;
  right?: SwipeAction;
}

const ACTION_WIDTH = 84;

/**
 * Swipe-to-act, used by the task list. The action panes ignore the animated
 * progress values and render statically — a coloured pane sliding in from the
 * edge is all the affordance the gesture needs, and it keeps this off the
 * worklet path.
 */
export function SwipeRow({ children, left, right }: SwipeRowProps) {
  const theme = useTheme();
  const swipeable = useRef<SwipeableMethods>(null);

  const renderAction = (action: SwipeAction, side: 'left' | 'right') =>
    function SwipeActionPane() {
      return (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => {
            if (!action.keepOpen) swipeable.current?.close();
            action.onPress();
          }}
          scaleTo={0.94}
          style={[
            styles.action,
            { backgroundColor: action.background },
            side === 'left' ? styles.actionLeft : styles.actionRight,
          ]}>
          <Icon name={action.icon} size={20} tint={action.tint} />
          <Text variant="caption" tint={action.tint} numberOfLines={1}>
            {action.label}
          </Text>
        </PressableScale>
      );
    };

  return (
    <ReanimatedSwipeable
      ref={swipeable}
      friction={2}
      leftThreshold={ACTION_WIDTH / 2}
      rightThreshold={ACTION_WIDTH / 2}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={left ? renderAction(left, 'left') : undefined}
      renderRightActions={right ? renderAction(right, 'right') : undefined}>
      <View style={{ backgroundColor: theme.surface }}>{children}</View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  action: {
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  actionLeft: { borderTopLeftRadius: Radius.md, borderBottomLeftRadius: Radius.md },
  actionRight: { borderTopRightRadius: Radius.md, borderBottomRightRadius: Radius.md },
});
