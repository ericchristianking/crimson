import React from 'react';
import type { IconProps } from 'phosphor-react-native';
import {
  HeartIcon,
  StarIcon,
  MoonIcon,
  SunIcon,
  FlowerLotusIcon,
  ButterflyIcon,
  DiamondIcon,
  LightningIcon,
  CrownIcon,
  SparkleIcon,
  FireIcon,
  SnowflakeIcon,
  LeafIcon,
  CatIcon,
  PawPrintIcon,
  BirdIcon,
  EyeIcon,
  CompassIcon,
  AnchorIcon,
  ClubIcon,
  SunHorizonIcon,
  DropIcon,
  MountainsIcon,
  ShootingStarIcon,
} from 'phosphor-react-native';

export type PartnerIconEntry = {
  key: string;
  component: React.ComponentType<IconProps>;
};

export const PARTNER_ICONS: PartnerIconEntry[] = [
  { key: 'heart', component: HeartIcon },
  { key: 'star', component: StarIcon },
  { key: 'moon', component: MoonIcon },
  { key: 'sun', component: SunIcon },
  { key: 'flower-lotus', component: FlowerLotusIcon },
  { key: 'butterfly', component: ButterflyIcon },
  { key: 'diamond', component: DiamondIcon },
  { key: 'lightning', component: LightningIcon },
  { key: 'crown', component: CrownIcon },
  { key: 'sparkle', component: SparkleIcon },
  { key: 'fire', component: FireIcon },
  { key: 'snowflake', component: SnowflakeIcon },
  { key: 'leaf', component: LeafIcon },
  { key: 'cat', component: CatIcon },
  { key: 'paw-print', component: PawPrintIcon },
  { key: 'bird', component: BirdIcon },
  { key: 'eye', component: EyeIcon },
  { key: 'compass', component: CompassIcon },
  { key: 'anchor', component: AnchorIcon },
  { key: 'club', component: ClubIcon },
  { key: 'sun-horizon', component: SunHorizonIcon },
  { key: 'drop', component: DropIcon },
  { key: 'mountains', component: MountainsIcon },
  { key: 'shooting-star', component: ShootingStarIcon },
];

const iconMap = new Map(PARTNER_ICONS.map((i) => [i.key, i.component]));

export function getIconComponent(key: string): React.ComponentType<IconProps> | null {
  return iconMap.get(key) ?? null;
}
