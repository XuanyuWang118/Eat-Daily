export enum PriceLevel {
  CHEAP = 1,   // ¥ (< 20)
  MODERATE = 2, // ¥¥ (20 - 60)
  EXPENSIVE = 3, // ¥¥¥ (60 - 150)
  LUXURY = 4    // ¥¥¥¥ (> 150)
}

export interface FoodItem {
  id: string;
  imageNo: number; // For mapping to food_[No].jpg
  name: string;
  location: string;
  priceLevel: PriceLevel;
  tags: string[]; // e.g., "Noodles", "Spicy", "Quick"
  rating: number; // 1-5, inferred from post
  postDate: string; // Date string from the post
  originalPost?: string; // The raw tweet/review content
  originalUrl?: string; // Link to Xiaohongshu
  recommendationIndex?: number; // 1-10
}

export interface FilterState {
  maxPrice: PriceLevel;
  tags: string[];
}

export const CATEGORIES = [
  "快餐", "火锅", "日料", "烧烤", "面食", "西餐", "家常菜", "甜点", "奶茶", "食堂", "外卖", "小吃"
];
