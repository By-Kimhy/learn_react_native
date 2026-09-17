import type { StyleProp, ViewStyle } from 'react-native';

import { StatTile } from '@/components/ui/stat-tile';
import type { IconName } from '@/components/ui/icon';
import type { AccentName } from '@/constants/theme';
import type { Currency } from '@/types';

import { formatAmount } from '../currency';
import type { AmountTone } from './amount';

export interface StatCardProps {
  label: string;
  value: number;
  currency: Currency;
  secondaryValue?: number;
  secondaryCurrency?: Currency;
  tone?: AmountTone;
  /** Overrides the colour derived from `tone` — for neutral figures like an average. */
  accent?: AccentName;
  sign?: 'auto' | 'always' | 'never';
  icon?: IconName;
  /** `tinted` for the Money summary row, `plain` for the Statistics grid. */
  variant?: 'tinted' | 'plain';
  style?: StyleProp<ViewStyle>;
}

/** A money figure in a tile — the shared shape behind Money and Statistics. */
export function StatCard({
  label,
  value,
  currency,
  secondaryValue,
  secondaryCurrency,
  tone = 'neutral',
  accent,
  sign = 'auto',
  icon,
  variant = 'tinted',
  style,
}: StatCardProps) {
  const resolved = accent ?? ({ income: 'green', expense: 'red', neutral: 'blue' } as const)[tone];

  return (
    <StatTile
      label={label}
      value={formatAmount(value, currency, { sign })}
      sub={
        secondaryValue !== undefined && secondaryCurrency
          ? formatAmount(secondaryValue, secondaryCurrency, { sign })
          : undefined
      }
      icon={icon}
      tone={resolved}
      variant={variant}
      style={style}
    />
  );
}
