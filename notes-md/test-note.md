---
slug: test-note
title: 测试示例：用 Markdown 驱动一篇正式可发布的 Notes
description: 一篇示例笔记，用来验证当前站点的 Markdown 到 HTML 生成链是否正常工作。
date: 2026
theme: Publishing Workflow
readingTime: 2 min
eyebrow: Note 04 / Example
intro: 这是一篇示例笔记，用来验证当前站点已经支持 Markdown 作为写作源文件，再由脚本生成正式的 HTML 发布页。
callout: 这篇的目的不是内容本身，而是确认 Markdown、模板、首页卡片和 404 入口都能一起联动更新。
cardEyebrow: 笔记 04 / 示例
cardTitle: 用 Markdown 驱动一篇正式可发布的 Notes
cardSummary: 这篇示例用来验证当前站点的 Markdown 到 HTML 生成链，以及首页和 404 的自动同步。
notFoundSummary: 从这篇测试笔记进入，可以快速确认当前站点的内容生成链是否已经接通。
related:
  - personal-site-is-not-a-resume
  - quiet-before-busy
---

这是一篇专门用于测试的示例笔记。它的目标不是提供新的观点，而是确认当前这套个人网站已经支持用 Markdown 作为内容源文件，再统一生成正式的 HTML 发布页。

## 为什么要做这一步

如果每一篇笔记都手写完整 HTML，后续维护成本会越来越高。你不仅要写正文，还要同步更新标题、描述、相关推荐、首页卡片和 404 页面里的继续阅读入口。

而 Markdown 作为源文件时，内容层就会变得更轻：

- 文章正文只关心写作本身
- 页面壳子继续复用现有设计
- 发布时统一生成 HTML
- 首页和 404 的文章入口可以自动更新

## 这篇示例会验证什么

这篇笔记一旦被加入 `notes-md/`，构建脚本就应该同时完成几件事：

1. 生成对应的 `notes/test-note.html`
2. 把它加入首页的 Notes 卡片区
3. 把它加入 `404.html` 的继续阅读入口
4. 把它加入 `sitemap.xml`

如果这些都发生了，就说明当前内容链已经具备继续扩展的基础。

## 之后怎么用

以后你只需要继续在 `notes-md/` 里新增 Markdown 文件，按 frontmatter 规范填写信息，再运行一次生成脚本，就可以得到完整的发布产物。

对你来说，Markdown 是写作入口；对站点来说，HTML 仍然是最终发布格式。这两者分开之后，内容和设计都更容易继续维护。
