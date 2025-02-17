'use client'

import React from "react"
import {
  AlarmClockCheck,
  Angry,
  Annoyed,
  Armchair,
  BatteryCharging,
  Bed,
  Bird,
  BookCheck,
  BookOpenText,
  BookType,
  BriefcaseBusiness,
  BriefcaseMedical, Brush,
  Cake,
  CalendarHeart,
  Cigarette,
  ClockAlert,
  CloudFog,
  CloudRain,
  Cloudy,
  Coffee,
  Cookie,
  CookingPot,
  CupSoda,
  Drumstick,
  Dumbbell,
  EggFried,
  FerrisWheel,
  Film,
  Flower2,
  Footprints,
  Frown,
  Gamepad2,
  Gift,
  Guitar,
  HandCoins,
  Handshake,
  Headphones,
  Heart,
  HeartCrack,
  HeartHandshake,
  Hospital,
  House,
  HousePlus,
  Leaf,
  LucideIcon,
  MessageCircleOff,
  MessagesSquare,
  Milestone,
  NotebookPen,
  Palette,
  PartyPopper,
  Pill,
  Pizza,
  Plane,
  Rocket,
  School,
  Scissors,
  ShoppingBag,
  ShoppingBasket,
  Snowflake,
  Sun,
  ThermometerSun,
  Trophy,
  Tv,
  Users,
  Utensils, WashingMachine,
  Weight,
  Wind,
  Wine,
  X
} from "lucide-react";
import {BowlSteam, Broom, Hand, HandSoap, SmileyNervous} from "@phosphor-icons/react";

interface AttributeIconProps {
  category: string
  attribute: string
}

const AttributeIcon: React.FC<AttributeIconProps> = ({
  category, attribute
}) => {
  const DEFAULT_ICON = X;
  const ICON_MAP: Record<string, Record<string, LucideIcon | null>> = {
    'other': {
      'alcohol': Wine,
      'smoking': Cigarette,
      'coffee': Coffee,
      'snack': Cookie,
      'beverage': CupSoda,
    },
    'weather': {
      'sunny': Sun,
      'cloudy': Cloudy,
      'rainy': CloudRain,
      'snowy': Snowflake,
      'windy': Wind,
    },
    'school': {
      'class': School,
      'study': BookType,
      'homework': NotebookPen,
      'exam': BookCheck,
      'team project': MessagesSquare,
    },
    'emotions': {
      'excited': PartyPopper,
      'relaxed': Armchair,
      'proud': Trophy,
      'hopeful': Milestone,
      'happy': Flower2,
      'enthusiastic': Rocket,
      'content': Bird,
      'refreshed': BatteryCharging,
      'depressed': CloudFog,
      'lonely': Leaf,
      'anxious': SmileyNervous,
      'sad': Frown,
      'angry': Angry,
      'pressured': Weight,
      'annoyed': Annoyed,
      'tired': Bed,
    },
    'hobbies': {
      'exercise': Dumbbell,
      'movie/TV': Tv,
      'gaming': Gamepad2,
      'reading': BookOpenText,
      'instrument': Guitar,
      'walk': Footprints,
      'music': Headphones,
      'art': Palette,
    },
    'meals': {
      'breakfast': EggFried,
      'lunch': Pizza,
      'dinner': Drumstick,
    },
    'beauty': {
      'hair': Scissors,
      'nails': Hand,
      'skincare': HandSoap,
      'makeup': Brush,
    },
    'chores': {
      'cleaning': Broom,
      'cooking': CookingPot,
      'laundry': WashingMachine,
      'dishes': BowlSteam,
    },
    'people': {
      'friends': Users,
      'family': HousePlus,
      'partner': Heart,
      'acquaintance': Handshake,
      'none': MessageCircleOff,
    },
    'work': {
      'end on time': AlarmClockCheck,
      'overtime': ClockAlert,
      'staff meal': HandCoins,
      'business trip': BriefcaseBusiness,
    },
    'relationship': {
      'date': HeartHandshake,
      'anniversary': CalendarHeart,
      'gift': Gift,
      'conflict': HeartCrack,
    },
    'health': {
      'sick': ThermometerSun,
      'hospital': Hospital,
      'checkup': BriefcaseMedical,
      'medicine': Pill,
    },
    'events': {
      'cinema': Film,
      'theme park': FerrisWheel,
      'shopping': ShoppingBag,
      'picnic': ShoppingBasket,
      'stay home': House,
      'party': Cake,
      'restaurant': Utensils,
      'travel': Plane,
    },
  }

  const IconComponent = ICON_MAP[category]?.[attribute] ?? DEFAULT_ICON

  return <IconComponent className='w-5 h-5 inline-block mr-1'/>
}

export default AttributeIcon