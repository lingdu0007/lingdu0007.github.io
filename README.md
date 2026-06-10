# Ling Du Personal Website

一个为 `lingdu0007.github.io` 用户主站整理过的静态个人网站版本。

## 目录说明

- `index.html`: 首页主文件
- `404.html`: GitHub Pages 404 页面
- `robots.txt`: 搜索引擎抓取规则
- `sitemap.xml`: 站点地图
- `site.webmanifest`: 基础 PWA/安装描述
- `assets/favicon.svg`: 站点图标
- `assets/og-image.png`: 分享卡片预览图
- `notes-md/*.md`: Notes 的 Markdown 源文件
- `templates/note-shell.html`: 由当前 open-design 风格提炼出的文章模板
- `scripts/build-notes.mjs`: Markdown 生成 HTML 的脚本
- `.github/workflows/pages.yml`: GitHub Pages 自动部署工作流

## 上线前你只需要替换的内容

- 首页首屏里的 `所在地 / 待填写`
- 联系区的邮箱、GitHub、X、小红书、即刻占位内容
- 作品名、年份、简介，如果你想换成真实项目
- 如果你将来切换到自定义域名：
  - `index.html` 里的 `canonical`、`og:url`、`og:image`
  - `robots.txt`
  - `sitemap.xml`

## 本地预览

在当前目录运行：

```bash
node scripts/build-notes.mjs
python3 -m http.server 4174
```

然后访问 `http://127.0.0.1:4174/`。

## Notes 写作流

现在 Notes 文章支持：

1. 在 `notes-md/` 下写 Markdown 源文件
2. 运行：

```bash
node scripts/build-notes.mjs
```

3. 脚本会自动：

- 生成 `notes/*.html`
- 更新首页 `Notes` 卡片
- 更新 `404.html` 里的继续阅读卡片
- 更新 `sitemap.xml`

### Frontmatter 字段

每篇 Markdown 顶部需要：

```md
---
slug: your-note-slug
title: 文章标题
description: 用于 SEO 和分享卡片
date: 2026
theme: Information Architecture
readingTime: 3 min
eyebrow: Note 01 / Interface
intro: 文章首段引导
callout: 右侧摘要卡片文案
cardEyebrow: 笔记 01 / 结构
cardTitle: 首页卡片标题
cardSummary: 首页卡片摘要
notFoundSummary: 404 页面里的引导摘要
related:
  - another-slug
  - one-more-slug
---
```

## GitHub Pages 部署

这个目录已经按 `lingdu0007.github.io` 用户主站准备好了。

1. 把仓库名称改成 `lingdu0007.github.io`
2. 把这些文件推到仓库默认分支 `main`
3. 在 GitHub 仓库设置里打开 Pages
4. Source 选择 `GitHub Actions`
5. 首次 push 后等待 workflow 完成

部署完成后，主站地址会是：

```text
https://lingdu0007.github.io/
```
