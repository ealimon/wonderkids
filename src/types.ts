export type GameType = 'sorter' | 'matcher' | 'pattern' | 'garden' | 'phonics' | 'math' | 'subtraction' | 'reading';

export interface SoundToggle {
  muted: boolean;
}

export interface ScoreState {
  stars: number;
  completedGames: { [key in GameType]?: number };
}

// Types for Color Sorter Game
export interface SorterItem {
  id: string;
  emoji: string;
  name: string;
  color: string; // 'red' | 'blue' | 'green' | 'yellow'
}

export interface SorterBucket {
  color: string;
  label: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

// Types for Shape Matcher Game
export interface ShapeItem {
  id: string;
  type: string; // 'circle' | 'square' | 'triangle' | 'star' | 'heart'
  emoji: string;
  color: string;
  svgPath: string;
}

// Types for Pattern Completer Game
export interface PatternItem {
  id: string;
  color: string;
  emoji: string;
  shape: 'circle' | 'square' | 'star' | 'heart';
}

export interface PatternQuestion {
  sequence: PatternItem[];
  options: PatternItem[];
  correctIndex: number;
  targetIndex: number; // usually the last item (index 3 or 4)
}

// Types for Counting Garden Game
export interface GardenFlower {
  id: string;
  emoji: string;
  x: number; // percentage width
  y: number; // percentage height
  scale: number;
  tapped: boolean;
  tapOrder?: number;
}
