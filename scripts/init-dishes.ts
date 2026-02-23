// 批量导入初始菜品数据到 GitHub Issues
// 运行: npm run init-dishes

import { Octokit } from 'octokit';

// 从环境变量读取配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';

if (!GITHUB_TOKEN || !GITHUB_REPO) {
  console.error('请设置 GITHUB_TOKEN 和 GITHUB_REPO 环境变量');
  process.exit(1);
}

const [owner, repo] = GITHUB_REPO.split('/');

// 初始菜品数据
const initialDishes = {
  '凉拌': [
    '炝拌包菜', '凉拌永丰扁萝卜', '爽口拍黄瓜', '凉拌莴笋片', '老虎菜',
    '青椒擂茄子', '蘸水豆腐', '藤椒钵钵鸡', '青椒凉拌皮蛋', '卤牛肉'
  ],
  '小炒肉菜': [
    '藜蒿炒腊肉', '荷兰豆炒腊肠', '豌豆炒腊肉', '莲藕炒牛肚', '竹笋炒牛肉',
    '腊肉炒耳菜', '小炒黄牛肉', '萍乡小炒肉', '小炒腊鸭腿', '青红椒炒肉丝',
    '绝味鸭三件', '辣炒鸡尖', '肉末豆腐', '糖醋排骨', '椒盐排骨',
    '椒盐鸡块', '青椒烧鸡腿', '包菜炒五花肉', '大蒜苗回锅肉', '蒜苔炒肉丝',
    '辣炒花甲', '辣炒钉螺', '辣炒田螺', '木耳炒肉', '毛豆炒肉',
    '香菇炖鸡', '红烧肉（梅菜、豆泡可选）', '茭白炒肉', '冬笋炒腊肉', '黄豆焖鸡脚',
    '临沂炒鸡', '辣炒鸭胗', '红烧小鲫鱼', '红烧小鳜鱼', '菜花炒肉'
  ],
  '小炒素菜': [
    '芹菜炒香干', '手撕包菜', '香煎豆腐（老好吃了）', '芹菜炒扁萝卜', '泡椒鹌鹑蛋炒木耳',
    '辣椒炒鸡蛋', '西红柿炒蛋', '麻婆豆腐', '清炒藜蒿', '酸辣土豆丝儿',
    '酸辣藕丝', '荷塘月色（荷兰豆炒莲藕片）', '辣椒炒梅菜', '红辣椒清炒绿豆芽', '清炒茄子',
    '虎皮尖椒', '干煸四季豆', '空心菜梗', '鹅蛋粉皮', '农家一碗香（青红椒肉片炒鸡蛋）'
  ],
  '清蒸类': [
    '清蒸鲈鱼', '清蒸基围虾', '蒸蛋', '清蒸梭子蟹', '清蒸大闸蟹', '蒸腊肉'
  ],
  '主食类': [
    '热乎乎软乎乎的蒸馒头', '香喷喷的大米饭', '山东老家的煎饼', '面条',
    '煎蛋粉丝', '螺蛳粉', '手工水饺'
  ],
  '汤类': [
    '玉米排骨汤', '江西瓦罐汤'
  ]
};

async function initDishes() {
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  console.log('开始导入菜品...\n');

  let total = 0;
  let success = 0;
  let failed = 0;

  for (const [category, dishes] of Object.entries(initialDishes)) {
    console.log(`\n分类: ${category}`);

    for (const dishName of dishes) {
      total++;
      try {
        const body = `---
image:
description:
rating_count: 0
rating_sum: 0
order_count: 0
created_at: ${new Date().toISOString().split('T')[0]}
---

等待补充图片和描述`;

        await octokit.rest.issues.create({
          owner,
          repo,
          title: dishName,
          body,
          labels: ['dish', `category:${category}`],
        });

        console.log(`  ✓ ${dishName}`);
        success++;

        // 延迟避免触发限流
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error(`  ✗ ${dishName}: ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\n\n导入完成！`);
  console.log(`总计: ${total}, 成功: ${success}, 失败: ${failed}`);
}

initDishes().catch(console.error);
