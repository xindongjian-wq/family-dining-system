# 今天吃什么 - 家庭点餐系统

一个简单的家庭点餐/吃饭日记系统，扫码查看菜品并记录点餐。

## 功能

- 菜品展示（分类筛选、搜索）
- 添加菜品（图+文+描述）
- 点餐记录（时间戳+用户名）
- 评分统计（打星+热度）
- 吃饭日记（时间线）

## 技术栈

- Next.js 15 + TypeScript
- Tailwind CSS
- GitHub Issues 作为数据存储
- Vercel 部署

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：

创建 `.env.local` 文件：
```bash
# GitHub Token - 用于操作 GitHub Issues
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# GitHub 数据仓库 - 用于存储菜品数据
GITHUB_REPO=your-username/family-dining-data
```

3. 创建数据仓库：
- 在 GitHub 上创建一个新仓库 `family-dining-data`
- 这个仓库将存储菜品数据（Issues）和图片

4. 运行开发服务器：
```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

1. 将代码推送到 GitHub

2. 在 Vercel 中导入项目：
   - 访问 https://vercel.com
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

3. 配置环境变量：
   - 在 Vercel 项目设置中添加环境变量
   - `GITHUB_TOKEN` - 你的 GitHub Personal Access Token
   - `GITHUB_REPO` - 数据仓库名称（如 `username/family-dining-data`）

4. 部署完成！

## 初始菜品数据

项目包含约 85 道菜的初始数据，分类如下：
- 凉拌菜（10道）
- 小炒肉菜（35道）
- 小炒素菜（25道）
- 清蒸类（6道）
- 主食类（7道）
- 汤类（2道）

### 批量导入菜品

配置好环境变量后，运行以下命令批量导入初始菜品：

```bash
npm run init-dishes
```

这会在你的 GitHub 数据仓库中创建约 85 个 Issues，每个 Issue 代表一道菜。之后可以通过 "添加菜品" 功能补充图片和描述。
