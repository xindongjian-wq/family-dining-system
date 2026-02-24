// GitHub API 封装 - 使用原生 fetch
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const [owner, repo] = GITHUB_REPO.split('/');

const headers = {
  'Authorization': `Bearer ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
};

export const githubApi = {
  // 获取所有菜品（Issues）
  async getDishes() {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=dish&per_page=100&sort=created&direction=desc`,
      { headers }
    );

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  },

  // 获取单个菜品详情（包含评论）
  async getDish(issueNumber: number) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const [issueRes, commentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=100`, { headers }),
    ]);

    if (!issueRes.ok) {
      throw new Error(`GitHub API error: ${issueRes.status}`);
    }

    const issue = await issueRes.json();
    const comments = await commentsRes.json();

    return { issue, comments };
  },

  // 创建菜品
  async createDish(title: string, body: string, labels: string[]) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        labels: ['dish', ...labels],
      }),
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  },

  // 添加点餐记录（评论）
  async addOrder(issueNumber: number, comment: string) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: comment }),
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  },

  // 更新菜品元数据
  async updateDish(issueNumber: number, body: string) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  },

  // 上传图片到仓库
  async uploadImage(path: string, contentBase64: string) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Upload image: ${path}`,
        content: contentBase64,
      }),
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  },

  // 获取所有评论（用于吃饭日记）
  async getAllComments() {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const issuesRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=dish&per_page=100`,
      { headers }
    );

    if (!issuesRes.ok) {
      throw new Error(`GitHub API error: ${issuesRes.status}`);
    }

    const issues = await issuesRes.json();
    const allComments: any[] = [];

    for (const issue of issues) {
      const commentsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments?per_page=100`,
        { headers }
      );
      const comments = await commentsRes.json();
      allComments.push(...comments.map((c: any) => ({ ...c, dish_title: issue.title })));
    }

    return allComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // 删除菜品（关闭 issue）
  async deleteDish(issueNumber: number) {
    if (!owner || !repo) throw new Error('GITHUB_REPO not configured');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'closed' }),
    });

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`);
    }

    return await res.json();
  },
};
