import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
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
  index: { labelKey: 'tabs.home', icon: 'home-outline', activeIcon: 'home' },
  notes: { labelKey: 'tabs.notes', icon: 'document-text-outline', activeIcon: 'document-text' },
  money: { labelKey: 'tabs.money', icon: 'wallet-outline', activeIcon: 'wallet' },
  more: { labelKey: 'tabs.more', icon: 'apps-outline', activeIcon: 'apps' },
};

export interface AppTabBarProps extends BottomTabBarProps {
  onCreatePress: () => void;
}

/**
 * A custom tab bar so the "+" can sit in the middle as a raised button — the
 * app's primary action, reachable with a thumb from any screen.
 */
export function AppTabBar({ state, navigation, insets, onCreatePress }: AppTabBarProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const t = useT();

  const routes = state.routes.filter((route) => route.name in TABS);
  const half = Math.ceil(routes.length / 2);

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
          size={23}
          tint={focused ? theme.primary : theme.textTertiary}
        />
        <Text
          variant="caption"
          tint={focused ? theme.primary : theme.textTertiary}
          numberOfLines={1}
          style={styles.label}>
          {t(meta.labelKey)}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
        },
      ]}>
      <View style={styles.row}>
        {routes.slice(0, half).map(renderTab)}

        <View style={styles.centerSlot}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t('tabs.create')}
            onPress={onCreatePress}
            scaleTo={0.9}
            style={[
              styles.createButton,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
              scheme === 'dark' && styles.createButtonDark,
            ]}>
            <Icon name="add" size={30} tint={theme.onPrimary} />
          </PressableScale>
        </View>

        {routes.slice(half).map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 46,
    paddingHorizontal: Spacing.xs,
  },
  label: { fontSize: 11 },
  // Reserves a column so the raised button doesn't crowd the neighbouring tabs.
  centerSlot: { width: 72, alignItems: 'center' },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // Lifts the button above the bar without changing the bar's own height.
    marginTop: -22,
    ...Platform.select({
      ios: { shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
      android: { elevation: 6 },
      default: {},
    }),
  },
  createButtonDark: { shadowOpacity: 0.5 },
});
