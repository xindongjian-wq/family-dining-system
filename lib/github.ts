// GitHub API 封装 - 使用服务器端调用
import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// 从环境变量获取仓库信息
const repoFullName = process.env.GITHUB_REPO || '';
const [owner, repo] = repoFullName.split('/');

console.log('GitHub API configured for:', owner, repo);

export const githubApi = {
  // 获取所有菜品（Issues）
  async getDishes() {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      state: 'open',
      labels: 'dish',
      per_page: 100,
      sort: 'created',
      direction: 'desc',
    });
    return issues.data;
  },

  // 获取单个菜品详情（包含评论）
  async getDish(issueNumber: number) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const [issue, comments] = await Promise.all([
      octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
        owner,
        repo,
        issue_number: issueNumber,
      }),
      octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100,
      }),
    ]);
    return { issue: issue.data, comments: comments.data };
  },

  // 创建菜品
  async createDish(title: string, body: string, labels: string[]) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    return await octokit.request('POST /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      title,
      body,
      labels: ['dish', ...labels],
    });
  },

  // 添加点餐记录（评论）
  async addOrder(issueNumber: number, comment: string) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    return await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo,
      issue_number: issueNumber,
      body: comment,
    });
  },

  // 更新菜品元数据
  async updateDish(issueNumber: number, body: string) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    return await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number: issueNumber,
      body,
    });
  },

  // 上传图片到仓库
  async uploadImage(path: string, contentBase64: string) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    return await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      message: `Upload image: ${path}`,
      content: contentBase64,
    });
  },

  // 获取所有评论（用于吃饭日记）
  async getAllComments() {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const issues = await octokit.request('GET /repos/{owner}/{repo}/issues', {
      owner,
      repo,
      state: 'open',
      labels: 'dish',
      per_page: 100,
    });

    const allComments: any[] = [];
    for (const issue of issues.data) {
      const comments = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner,
        repo,
        issue_number: issue.number,
        per_page: 100,
      });
      allComments.push(...comments.data.map((c: any) => ({ ...c, dish_title: issue.title })));
    }

    return allComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
};
