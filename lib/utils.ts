// 工具函数

import type { DishMetadata } from './types';

// 解析 Issue body 中的 YAML 元数据
export function parseDishMetadata(body: string): DishMetadata {
  const defaultMetadata: DishMetadata = {
    image: '',
    description: '',
    rating_count: 0,
    rating_sum: 0,
    order_count: 0,
    created_at: '',
  };

  // 尝试提取 YAML frontmatter
  const yamlMatch = body.match(/^---\n([\s\S]+?)\n---/);
  if (!yamlMatch) return defaultMetadata;

  const yaml = yamlMatch[1];
  const metadata: any = {};

  // 简单解析 YAML（只解析 key: value 格式）
  yaml.split('\n').forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'rating_count' || key === 'rating_sum' || key === 'order_count') {
        metadata[key] = parseInt(value) || 0;
      } else {
        metadata[key] = value;
      }
    }
  });

  return { ...defaultMetadata, ...metadata };
}

// 构建 YAML 元数据
export function buildDishMetadata(metadata: Partial<DishMetadata>): string {
  const { image = '', description = '', rating_count = 0, rating_sum = 0, order_count = 0, created_at = '' } = metadata;

  return `---
image: ${image}
description: ${description}
rating_count: ${rating_count}
rating_sum: ${rating_sum}
order_count: ${order_count}
created_at: ${created_at || new Date().toISOString().split('T')[0]}
---

${description || ''}`;
}

// 解析评论中的订单记录
export function parseOrderComment(body: string) {
  try {
    // 尝试解析 JSON
    const jsonMatch = body.match(/```json\n([\s\S]+?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 尝试直接解析 JSON
    return JSON.parse(body);
  } catch {
    return null;
  }
}

// 构建订单评论
export function buildOrderComment(data: {
  dish_id: number;
  dish_name: string;
  user: string;
  rating?: number;
  comment?: string;
}): string {
  return `\\\`\\\`\\\`json
{
  "type": "order",
  "dish_id": ${data.dish_id},
  "dish_name": "${data.dish_name}",
  "user": "${data.user}",
  "timestamp": "${new Date().toISOString()}",
  "rating": ${data.rating || 0},
  "comment": "${data.comment || ''}"
}
\\\`\\\`\\\``;
}

// 格式化时间
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

// 按日期分组
export function groupByDate(items: any[], dateKey: string = 'created_at') {
  const groups: Record<string, any[]> = {};

  items.forEach(item => {
    const date = new Date(item[dateKey]);
    const formattedDateKey = formatDateKey(date);
    if (!groups[formattedDateKey]) groups[formattedDateKey] = [];
    groups[formattedDateKey].push(item);
  });

  return groups;
}

// 格式化日期key
function formatDateKey(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) return '今天';
  if (itemDate.getTime() === yesterday.getTime()) return '昨天';

  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
}
