'use client';

import { SmileyNervous } from '@phosphor-icons/react';
import {
  Angry,
  Annoyed,
  Armchair,
  BatteryCharging,
  Bed,
  Bird,
  BookCheck,
  BriefcaseBusiness,
  ClockAlert,
  CloudFog,
  Flower2,
  Frown,
  HandCoins,
  Leaf,
  LucideIcon,
  Milestone,
  NotebookPen,
  PartyPopper,
  Rocket,
  School,
  Trophy,
  Weight,
  X,
} from 'lucide-react';
import React from 'react';

interface AttributeIconProps {
  category: string;
  attribute: string;
}

const AttributeIcon: React.FC<AttributeIconProps> = ({
  category,
  attribute,
}) => {
  const DEFAULT_ICON = X;
  const ICON_MAP: Record<string, Record<string, LucideIcon | null>> = {
    school: {
      class: School,
      homework: NotebookPen,
      exam: BookCheck,
    },
    emotions: {
      excited: PartyPopper,
      relaxed: Armchair,
      proud: Trophy,
      hopeful: Milestone,
      happy: Flower2,
      enthusiastic: Rocket,
      content: Bird,
      refreshed: BatteryCharging,
      depressed: CloudFog,
      lonely: Leaf,
      anxious: SmileyNervous,
      sad: Frown,
      angry: Angry,
      pressured: Weight,
      annoyed: Annoyed,
      tired: Bed,
    },
    work: {
      overtime: ClockAlert,
      'staff meal': HandCoins,
      'business trip': BriefcaseBusiness,
    },
  };

  const IconComponent = ICON_MAP[category]?.[attribute] ?? DEFAULT_ICON;

  return <IconComponent className="w-5 h-5 inline-block mr-1" />;
};

export default AttributeIcon;
