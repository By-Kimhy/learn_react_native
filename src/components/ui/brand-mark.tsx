import { Image } from 'expo-image';
import { StyleSheet, type StyleProp, type ImageStyle } from 'react-native';

export interface BrandMarkProps {
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * LifeHub's own mark, for the places the app brands itself — the tab screens'
 * app bar and the Settings footer. The asset is the logo with its wordmark
 * cropped away and the plate keyed out, so it drops onto any tint.
 */
export function BrandMark({ size = 22, style }: BrandMarkProps) {
  return (
    <Image
      source={require('@/../assets/images/logo-mark.png')}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      // Decorative: the surrounding bar or footer already names the app.
      accessible={false}
      transition={0}
    />
  );
}

export const brandMarkStyles = StyleSheet.create({});
