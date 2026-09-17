import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing, type AccentName } from '@/constants/theme';
import { useAccents, useTheme } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { Text, tabularNumbers } from './text';

export interface StatTileProps {
  label: string;
  value: string;
  /** The small line under the value — a delta, a count, a target. */
  sub?: string;
  subTone?: AccentName | { soft: string; tint: string };
  icon?: IconName;
  tone?: AccentName | { soft: string; tint: string };
  /** `tinted` fills the whole tile; `plain` keeps a white card and tints only the icon. */
  variant?: 'tinted' | 'plain';
  style?: StyleProp<ViewStyle>;
}

/** The figure tiles on Money and Statistics. */
export function StatTile({
  label,
  value,
  sub,
  subTone,
  icon,
  tone = 'grey',
  variant = 'tinted',
  style,
}: StatTileProps) {
  const theme = useTheme();
  const accents = useAccents();
  const { soft, tint } = typeof tone === 'string' ? accents[tone] : tone;
  const subColour = subTone
    ? typeof subTone === 'string'
      ? accents[subTone].tint
      : subTone.tint
    : theme.textSecondary;

  const tinted = variant === 'tinted';

  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: tinted ? soft : theme.surface },
        !tinted && { borderWidth: StyleSheet.hairlineWidth, borderColor: theme.border },
        style,
      ]}>
      <View style={styles.head}>
        <Text
          variant={tinted ? 'overline' : 'captionStrong'}
          tint={tinted ? tint : theme.textSecondary}
          numberOfLines={1}
          style={styles.label}>
          {tinted ? label.toUpperCase() : label}
        </Text>

        {icon ? (
          tinted ? (
            <Icon name={icon} size={14} tint={tint} />
          ) : (
            <View style={[styles.iconDot, { backgroundColor: soft }]}>
              <Icon name={icon} size={14} tint={tint} />
            </View>
          )
        ) : null}
      </View>

      <Text
        variant="heading"
        tint={tinted ? tint : theme.text}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={tabularNumbers}>
        {value}
      </Text>

      {sub ? (
        <Text variant="caption" tint={subColour} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  // Shrinks before the value does — the number is the point of the tile.
  label: { flexShrink: 1 },
  iconDot: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
