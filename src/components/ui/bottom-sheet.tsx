import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

import { GlassSurface } from './glass-surface';
import { IconButton } from './icon-button';
import { Text } from './text';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  closeLabel?: string;
  children: ReactNode;
}

const OPEN_MS = 260;
const CLOSE_MS = 180;

/**
 * A plain RN `Modal` with an animated glass panel rather than a native sheet:
 * the behaviour is then identical on iOS, Android and web, which matters
 * because the "+" sheet is the app's most-used surface.
 */
export function BottomSheet({ visible, onClose, title, closeLabel = 'Close', children }: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? OPEN_MS : CLOSE_MS,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, progress]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.min(height * 0.5, 420), 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: theme.overlay, opacity: progress }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View style={[styles.wrapper, { transform: [{ translateY }] }]}>
          <GlassSurface effect="regular" style={styles.sheet}>
            <View style={[styles.highlight, { backgroundColor: theme.glassHighlight }]} />

            <View style={{ paddingBottom: insets.bottom + Spacing.lg }}>
              <View style={[styles.grabber, { backgroundColor: theme.borderStrong }]} />

              {title ? (
                <View style={styles.titleRow}>
                  <Text variant="heading" style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  <IconButton
                    name="close"
                    accessibilityLabel={closeLabel}
                    onPress={onClose}
                    size={20}
                    filled
                  />
                </View>
              ) : null}

              {children}
            </View>
          </GlassSurface>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  wrapper: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  highlight: {
    height: StyleSheet.hairlineWidth,
    // Spans the padded sheet edge to edge, so the specular line reaches the corners.
    marginHorizontal: -Spacing.lg,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: { flex: 1 },
});
