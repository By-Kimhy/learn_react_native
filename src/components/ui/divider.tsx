import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function Divider({ inset = 0 }: { inset?: number }) {
  const theme = useTheme();
  return <View style={[styles.line, { backgroundColor: theme.border, marginLeft: inset }]} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth },
});
