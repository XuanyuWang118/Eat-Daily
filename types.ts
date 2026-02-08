export enum PriceLevel {
  CHEAP = 1,   // ¥ (< 20)
  MODERATE = 2, // ¥¥ (20 - 60)
  EXPENSIVE = 3, // ¥¥¥ (60 - 150)
  LUXURY = 4    // ¥¥¥¥ (> 150)
}

export type CampusLocation = '校内' | '校外';

export interface FoodItem {
  id: string;
  imageNo: number; // For mapping to food_[No].jpg
  name: string;
  location: string;
  campusLocation: CampusLocation; // New field for precise filtering
  specificPrice?: string; // New field for display text (e.g. "¥15")
  priceLevel: PriceLevel;
  tags: string[]; // e.g., "Noodles", "Spicy", "Quick"
  rating: number; // Keep for sorting internally if needed, but won't display
  postDate: string; 
  originalPost?: string; 
  originalUrl?: string; 
  recommendationIndex?: number; 
}

export interface FilterState {
  locations: CampusLocation[]; // Support multi-select location
  tags: string[];
}

export const CATEGORIES = [
  "快餐", "火锅", "日料", "烧烤", "面食", "西餐", "家常菜", "甜点", "奶茶", "食堂", "外卖", "小吃"
];

export const LOCATIONS: CampusLocation[] = ["校内", "校外"];
