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
python3 -m http.server 4174
```

然后访问 `http://127.0.0.1:4174/`。

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
