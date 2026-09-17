import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { GlassSurface } from '@/components/ui/glass-surface';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, ShadowColor, Spacing, TabBarHeight } from '@/constants/theme';
import { useT } from '@/features/settings/store';
import { useColorScheme, useTheme } from '@/hooks/use-theme';
import type { TranslationKey } from '@/lib/i18n';

interface TabMeta {
  labelKey: TranslationKey;
  icon: IconName;
  activeIcon: IconName;
}

/** Route name → presentation. Keyed by file name under `app/(tabs)`. */
const TABS: Record<string, TabMeta> = {
  index: { labelKey: 'tabs.home', icon: 'grid-outline', activeIcon: 'grid' },
  notes: { labelKey: 'tabs.notes', icon: 'document-text-outline', activeIcon: 'document-text' },
  money: { labelKey: 'tabs.money', icon: 'wallet-outline', activeIcon: 'wallet' },
  more: { labelKey: 'tabs.more', icon: 'ellipsis-horizontal', activeIcon: 'ellipsis-horizontal' },
};

/** Width of the gap left in the pill for the raised "+". */
const CREATE_SLOT = 76;
const CREATE_SIZE = 56;
/** How far the "+" is lifted above the pill's vertical centre. */
const CREATE_LIFT = 14;

export interface AppTabBarProps extends BottomTabBarProps {
  onCreatePress: () => void;
}

/**
 * A floating glass pill rather than a bar attached to the screen edge: the
 * scene runs full height beneath it, so there is content for the material to
 * refract. The "+" sits in a gap in the pill and is lifted clear of it, which
 * is why it is a sibling of the pill rather than a child — a rounded, clipped
 * pill can't let a child overhang its own edge.
 */
export function AppTabBar({ state, navigation, insets, onCreatePress }: AppTabBarProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const t = useT();

  const routes = state.routes.filter((route) => route.name in TABS);
  const half = Math.ceil(routes.length / 2);
  const bottomInset = Math.max(insets.bottom, Spacing.md);

  const renderTab = (route: (typeof routes)[number]) => {
    const meta = TABS[route.name];
    const index = state.routes.indexOf(route);
    const focused = state.index === index;

    return (
      <PressableScale
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={t(meta.labelKey)}
        scaleTo={0.9}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        }}
        style={styles.tab}>
        <Icon
          name={focused ? meta.activeIcon : meta.icon}
          size={22}
          tint={focused ? theme.primary : theme.textTertiary}
        />
        <Text
          variant="caption"
          tint={focused ? theme.primary : theme.textTertiary}
          numberOfLines={1}
          style={[styles.label, focused && styles.labelActive]}>
          {t(meta.labelKey)}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <View style={styles.stack}>
        <GlassSurface
          effect="regular"
          interactive
          radius={Radius.pill}
          style={[styles.pill, scheme === 'light' && styles.pillShadowLight]}>
          {routes.slice(0, half).map(renderTab)}
          <View style={styles.createSlot} />
          {routes.slice(half).map(renderTab)}
        </GlassSurface>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t('tabs.create')}
          onPress={onCreatePress}
          scaleTo={0.9}
          style={[
            styles.createButton,
            {
              backgroundColor: theme.primary,
              borderColor: theme.background,
              shadowColor: theme.primary,
            },
          ]}>
          <Icon name="add" size={28} tint={theme.onPrimary} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.lg,
    // The bar floats over the scene, so only its own children take touches.
    pointerEvents: 'box-none',
  },
  stack: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  pill: {
    height: TabBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    overflow: 'hidden',
  },
  pillShadowLight: {
    ...Platform.select({
      ios: {
        shadowColor: ShadowColor,
        shadowOpacity: 0.1,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 48,
    paddingHorizontal: 2,
  },
  label: { fontSize: 11 },
  labelActive: { fontWeight: '600' },
  createSlot: { width: CREATE_SLOT, pointerEvents: 'none' },
  createButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: (TabBarHeight - CREATE_SIZE) / 2 + CREATE_LIFT,
    width: CREATE_SIZE,
    height: CREATE_SIZE,
    borderRadius: Radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 10 },
      default: {},
    }),
  },
});
