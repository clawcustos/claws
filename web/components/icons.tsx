'use client';

import {
  Home,
  Search,
  Trophy,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  User,
  BarChart3,
} from 'lucide-react';

export const Icons = {
  Home,
  Search,
  Trophy,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  User,
  Chart: BarChart3,
};

export type IconName = keyof typeof Icons;
