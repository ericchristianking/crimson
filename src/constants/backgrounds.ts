import type { PhaseKey } from '@/src/utils/todayInfo';
import type { ImageSourcePropType } from 'react-native';

export const PHASE_BACKGROUNDS: Record<PhaseKey, ImageSourcePropType> = {
  regular: require('@/assets/images/bg-regular.jpg'),
  period: require('@/assets/images/bg-period.jpg'),
  fertile: require('@/assets/images/bg-fertile.jpg'),
  ovulation: require('@/assets/images/bg-ovulation.jpg'),
  pms: require('@/assets/images/bg-pms.jpg'),
};

export const CALENDAR_BACKGROUND: ImageSourcePropType =
  require('@/assets/images/bg-calendar.jpg');

export const CRIMSON_LOGO: ImageSourcePropType =
  require('@/assets/images/logo-white.png');

export const CRIMSON_C: ImageSourcePropType =
  require('@/assets/images/c.png');
