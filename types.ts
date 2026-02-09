
export enum PriceLevel {
  CHEAP = "CHEAP",       // < 20
  MODERATE = "MODERATE", // 20 - 60
  EXPENSIVE = "EXPENSIVE" // > 60
}

export type CampusLocation = '校内' | '校外';

export interface FoodItem {
  id: string;
  imageNo: number; 
  name: string;
  location: string;
  campusLocation: CampusLocation;
  canteen?: string; // New field for specific canteen filtering (only for CampusLocation.ON_CAMPUS)
  specificPrice?: string; 
  priceLevel: PriceLevel;
  tags: string[]; 
  rating: number; 
  postDate: string; 
  originalPost?: string; 
  originalUrl?: string; 
  recommendationIndex?: number; 
}

export interface FilterState {
  locations: CampusLocation[];
  canteens: string[]; // New: Filter for specific canteens
  priceLevels: PriceLevel[];
  onlyTakeout: boolean; 
  categories: string[]; 
  scenes: string[]; 
}

// Group 1: Cuisine Categories (菜系/食物类别)
export const CUISINE_CATEGORIES = [
  "快餐", "面食", "米饭", "火锅", "烧烤", "日料", "西餐", "家常菜", 
  "轻食", "甜点", "奶茶", "小吃", "川菜", "韩式", "东南亚菜", 
  "潮汕菜", "西北菜", "鲁菜", "海鲜", "咖啡"
];

// Group 2: Scene & Flavor & Mode (场景/口味/形式)
// Removed '食堂' as it is now a location attribute. Added '减脂'.
export const SCENE_TAGS = [
  "一人食", "聚餐", "速食", "清淡", "辣", "清真", "养生", 
  "早餐", "夜宵", "外卖", "便宜", "约会", "减脂"
];

export const LOCATIONS: CampusLocation[] = ["校内", "校外"];

export const CANTEEN_OPTIONS = [
  "一餐", "二餐", "三餐", "四餐", "五餐", "六餐", "七餐", "玉兰苑", "其他"
];
