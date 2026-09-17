import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, type AccentName } from '@/constants/theme';
import { useAccents } from '@/hooks/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export interface IconTileProps {
  icon?: IconName;
  emoji?: string;
  tone?: AccentName | { soft: string; tint: string };
  size?: number;
  /** Menu rows use rounded squares; list and reminder rows use circles. */
  shape?: 'rounded' | 'circle';
  style?: StyleProp<ViewStyle>;
}

/** The tinted badge behind every category, menu entry and reminder source. */
export function IconTile({
  icon,
  emoji,
  tone = 'grey',
  size = 38,
  shape = 'rounded',
  style,
}: IconTileProps) {
  const accents = useAccents();
  const { soft, tint } = typeof tone === 'string' ? accents[tone] : tone;

  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? Radius.pill : Radius.sm,
          backgroundColor: soft,
        },
        style,
      ]}>
      {emoji ? (
        <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
      ) : icon ? (
        <Icon name={icon} size={Math.round(size * 0.5)} tint={tint} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});
