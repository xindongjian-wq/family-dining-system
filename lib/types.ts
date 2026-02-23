// 类型定义

export interface Dish {
  id: number;
  title: string;
  body: string;
  labels: Label[];
  created_at: string;
  updated_at: string;
  comments: number;
  metadata?: DishMetadata;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface DishMetadata {
  image: string;
  description: string;
  rating_count: number;
  rating_sum: number;
  order_count: number;
  created_at: string;
}

export interface OrderRecord {
  type: 'order';
  dish_id: number;
  dish_name: string;
  user: string;
  timestamp: string;
  rating?: number;
  comment?: string;
}

export interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: {
    login: string;
  };
}

export type Category = '凉拌' | '小炒肉菜' | '小炒素菜' | '清蒸类' | '主食类' | '汤类';

export const CATEGORIES: Category[] = ['凉拌', '小炒肉菜', '小炒素菜', '清蒸类', '主食类', '汤类'];

export const CATEGORY_COLORS: Record<Category, string> = {
  '凉拌': 'bg-green-100 text-green-800',
  '小炒肉菜': 'bg-red-100 text-red-800',
  '小炒素菜': 'bg-lime-100 text-lime-800',
  '清蒸类': 'bg-blue-100 text-blue-800',
  '主食类': 'bg-yellow-100 text-yellow-800',
  '汤类': 'bg-orange-100 text-orange-800',
};
