export interface FlowerTheme {
  name: string;
  description: string;
  palette: string[];
  petalShape: 'round' | 'pointed' | 'heart' | 'jagged';
  centerColor: string;
}

export interface Point {
  x: number;
  y: number;
}
