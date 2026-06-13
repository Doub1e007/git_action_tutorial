# GitHub Actions 从零到进阶 —— 完整教程

> 本教程带你从 CI/CD 零基础到能独立设计生产级流水线。
> 每个知识点都配有可运行的 `.yml` 文件，边看边跑。

---

## 目录

1. [什么是 CI/CD](#1-什么是-cicd)
2. [GitHub Actions 架构](#2-github-actions-架构)
3. [环境准备](#3-环境准备)
4. [第 1 课：Hello World](#4-第-1-课hello-world)
5. [第 2 课：触发器与上下文](#5-第-2-课触发器与上下文)
6. [第 3 课：实战 CI（构建+测试）](#6-第-3-课实战-ci构建测试)
7. [第 4 课：矩阵构建与缓存](#7-第-4-课矩阵构建与缓存)
8. [第 5 课：Job 间数据传递](#8-第-5-课job-间数据传递)
9. [第 6 课：Secrets 与 Environments](#9-第-6-课secrets-与-environments)
10. [第 7 课：Docker 集成](#10-第-7-课docker-集成)
11. [第 8 课：可复用工作流](#11-第-8-课可复用工作流)
12. [第 9 课：生产级 CI/CD](#12-第-9-课生产级-cicd)
13. [常见问题排查](#13-常见问题排查)
14. [学习路线图](#14-学习路线图)

---

## 1. 什么是 CI/CD

### 没有 CI/CD 之前（传统开发）

```
开发者写完代码 → 手动测试 → 手动打包 → 手动上传服务器 → 手动重启服务
```

**问题**: 容易漏步骤、每次操作不一致、团队协作时互相踩脚。

### 有了 CI/CD 之后（自动化）

```
开发者 git push → CI 自动触发
  ├─ 拉代码
  ├─ 安装依赖
  ├─ 代码规范检查（Lint）
  ├─ 运行测试
  ├─ 构建产物
  └─ CD: 自动部署到服务器
```

**好处**: 每次提交都经过相同的质量门禁，人工只做决策，机器做执行。

### 三个术语

| 缩写 | 全称 | 含义 |
|------|------|------|
| CI | Continuous Integration（持续集成） | 每次提交自动构建+测试，快速发现集成问题 |
| CD | Continuous Delivery（持续交付） | CI 通过后自动把代码部署到测试/预发布环境 |
| CD | Continuous Deployment（持续部署） | CI 通过后直接自动部署到生产环境（更高阶） |

**关键区别**: 持续交付 = 代码随时可部署（但按钮由人按）；持续部署 = 代码自动上生产。

---

## 2. GitHub Actions 架构

### 核心概念一张图

```
GitHub 仓库
  └── .github/workflows/
       ├── ci.yml          ← 一条 Workflow（流水线）
       │    on: push        ← Event（触发器）
       │    jobs:
       │      lint:          ← Job（任务，跑在一台虚拟机上）
       │        steps:       ← Step 列表（按顺序执行）
       │          - uses: actions/checkout@v4   ← 用别人的 Action
       │          - run: npm run lint            ← 直接跑脚本
       │      test:
       │        needs: [lint]   ← 等 lint 完了再跑
       │        steps: ...
       └── deploy.yml       ← 另一条 Workflow
```

### 三层嵌套关系

```
Workflow（.yml 文件）
  └── Job（独立虚拟机，默认并行）
       └── Step（顺序执行）
            ├── run: 脚本命令
            └── uses: 引用 Action
```

### Runner（执行器）

```
GitHub 托管（免费）:      自托管（私有服务器）:
  ubuntu-latest              你自己搭建的机器
  windows-latest             适合有特殊硬件/网络需求的场景
  macos-latest
```

免费额度（个人仓库）：每月 2000 分钟（Linux）、1000 分钟（Windows）、400 分钟（MacOS）。

---

## 3. 环境准备

### 第一步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. 仓库名填 `git_action_tutorial`
3. **不要**勾选 "Add a README file"（我们本地已有代码）
4. 点击 "Create repository"

### 第二步：推代码到 GitHub

```bash
git remote add origin https://github.com/你的用户名/git_action_tutorial.git
git add .
git commit -m "feat: GitHub Actions tutorial project"
git push -u origin master
```

### 第三步：查看流水线

打开 `https://github.com/你的用户名/git_action_tutorial/actions`，推送后流水线会自动开始运行。

---

## 4. 第 1 课：Hello World

**文件**: `.github/workflows/01-hello-world.yml`

### 最小可行流水线

```yaml
name: "My First Workflow"          # 流水线名称
on: [push]                          # 推送时触发
jobs:
  hello:
    runs-on: ubuntu-latest          # 运行环境
    steps:
      - run: echo "Hello World!"     # 执行命令
```

### 关键理解

- **文件位置必须是 `.github/workflows/xxx.yml`**，放在别处 GitHub 不认。
- 文件名随意，一个文件 = 一条独立的 Workflow。
- `runs-on` 决定了你的代码在什么操作系统上跑。

### 尝试修改

把 `01-hello-world.yml` 中的 `echo "Hello, GitHub Actions!"` 改成你自己的话，push 上去看看变化。

---

## 5. 第 2 课：触发器与上下文

**文件**: `.github/workflows/02-triggers-and-context.yml`

### 五种常用触发器

| 触发器 | 写法 | 什么时候触发 |
|--------|------|-------------|
| 代码推送 | `on: push` | git push 时 |
| Pull Request | `on: pull_request` | 创建/更新 PR 时 |
| 手动触发 | `on: workflow_dispatch` | 在 GitHub 网页点按钮 |
| 定时任务 | `on: schedule: [{cron: "0 0 * * *"}]` | 按 cron 表达式定时跑 |
| 被其他流水线调用 | `on: workflow_call` | 被另一个 Workflow 引用 |

### `${{ }}` 表达式

这是 GitHub Actions 的"灵魂语法"。你可以在 YAML 里用它嵌入动态值：

```yaml
- run: echo "当前分支是 ${{ github.ref }}"
- run: echo "提交者是 ${{ github.actor }}"
```

**核心上下文变量速查**:

| 表达式 | 示例值 | 含义 |
|--------|--------|------|
| `${{ github.event_name }}` | `push` | 触发事件类型 |
| `${{ github.ref }}` | `refs/heads/master` | 当前分支 |
| `${{ github.sha }}` | `a1b2c3d...` | 当前 commit hash |
| `${{ github.actor }}` | `yourname` | 触发者 |
| `${{ runner.os }}` | `Linux` | 操作系统 |
| `${{ env.VAR_NAME }}` | `...` | 你定义的环境变量 |
| `${{ secrets.NAME }}` | `***` | 你设置的密钥 |
| `${{ jobs.job_id.result }}` | `success` | 某 Job 的结果 |
| `${{ steps.step_id.outputs.name }}` | `...` | 某 Step 的输出 |

---

## 6. 第 3 课：实战 CI（构建+测试）

**文件**: `.github/workflows/03-build-and-test.yml`

### 标准 CI 流程

```
checkout（拉代码）
  → setup (装 Node/Python/Java...)
    → install dependencies
      → lint (代码规范检查)
        → test (运行测试)
          → report (生成报告)
```

### 最常用的两个官方 Action

```yaml
# 1. 拉代码（必用）
- uses: actions/checkout@v4

# 2. 装运行环境（按语言选）
- uses: actions/setup-node@v4      # Node.js
# actions/setup-python@v5          # Python
# actions/setup-java@v4            # Java
# actions/setup-go@v5              # Go
```

### 让报告出现在 Summary 页

```yaml
- run: echo "## 测试结果" >> $GITHUB_STEP_SUMMARY
- run: echo "✅ 全部通过" >> $GITHUB_STEP_SUMMARY
```

`$GITHUB_STEP_SUMMARY` 是一个特殊的文件路径，写入的内容会渲染成 Markdown 显示在 Actions 页面的 Summary 区域。

---

## 7. 第 4 课：矩阵构建与缓存

**文件**: `.github/workflows/04-matrix-and-cache.yml`

### 矩阵策略 —— 一套代码，多环境覆盖

```yaml
strategy:
  fail-fast: false              # 一个失败不取消其他
  matrix:
    os: [ubuntu-latest, windows-latest]
    node-version: [18, 20, 22]
```

上面会生成 `2 × 3 = 6` 个并行 Job，每个都是独立的 `os + node-version` 组合。

### 排除和添加

```yaml
matrix:
  os: [ubuntu-latest, windows-latest]
  node-version: [18, 20, 22]
  exclude:                      # 去掉不合理的组合
    - os: windows-latest
      node-version: 22
  include:                      # 额外加的特定组合
    - os: macos-latest
      node-version: 20
```

### 缓存加速

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm               # 缓存这个目录
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

- `key` 是缓存的唯一标识。`hashFiles()` 根据文件内容生成 hash。
- 如果 `package-lock.json` 没变，key 不变，缓存命中，跳过 `npm install`。
- 如果 lock 文件变了，自动生成新缓存。

---

## 8. 第 5 课：Job 间数据传递

**文件**: `.github/workflows/05-artifacts-and-outputs.yml`

### 两种传递方式

| 方式 | 用途 | 传递内容 |
|------|------|---------|
| Artifacts | 大文件 / 构建结果 | 文件、目录 |
| Outputs | 小数据 / 状态信息 | 字符串 |

### Artifacts（文件级传递）

```yaml
# Job A: 上传
- uses: actions/upload-artifact@v4
  with:
    name: my-build
    path: dist/

# Job B: 下载
- uses: actions/download-artifact@v4
  with:
    name: my-build
```

### Outputs（字符串级传递）

```yaml
# Job A: 输出
outputs:
  version: ${{ steps.step1.outputs.ver }}
steps:
  - id: step1
    run: echo "ver=1.2.3" >> $GITHUB_OUTPUT

# Job B: 读取
- run: echo "${{ needs.job_a.outputs.version }}"
```

---

## 9. 第 6 课：Secrets 与 Environments

**文件**: `.github/workflows/06-secrets-and-environments.yml`

### Secrets（密钥）

```
在 GitHub 网页设置: Settings → Secrets and variables → Actions → New repository secret

引用方式: ${{ secrets.NAME }}
引用 Variables: ${{ vars.NAME }}
```

**Secret 的安全特性**:
- 日志中自动替换为 `***`
- 不会传递给 fork 仓库的 PR（防止泄露）
- 设置后无法查看原值，只能覆盖

### Environments（环境）

在 Settings → Environments 创建环境后，可以配置：

| 保护规则 | 说明 |
|---------|------|
| Required reviewers | 部署前必须有人审批 |
| Wait timer | 等待 N 分钟后才执行 |
| Deployment branches | 限制哪些分支能部署 |
| Environment secrets | 该环境专属的密钥 |

```yaml
deploy:
  environment:
    name: production
    url: https://example.com     # 部署完在页面显示链接
```

---

## 10. 第 7 课：Docker 集成

**文件**: `.github/workflows/07-docker.yml`

### 场景一：用 Docker 容器当 CI 环境

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: node:20-alpine         # 在这个镜像里跑所有步骤
    services:                        # 启动辅助容器
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: testpass
```

### 场景二：构建并推送 Docker 镜像

```yaml
- uses: docker/login-action@v3     # 登录
- uses: docker/build-push-action@v6 # 构建+推送
  with:
    push: true
    tags: ghcr.io/用户名/仓库:latest
    cache-from: type=gha             # 用 GitHub Actions 缓存加速
```

`${{ secrets.GITHUB_TOKEN }}` 是 GitHub 临时生成的 Token，默认有读/写仓库的权限，无需手动创建。

---

## 11. 第 8 课：可复用工作流

**文件**: `.github/workflows/08-reusable-workflows.yml`

当你管理的仓库越来越多，可以把通用 CI 流程抽成模板：

```yaml
# 模板仓库中：
on:
  workflow_call:                     # 声明可被调用
    inputs:
      node-version:                  # 定义调用方可传的参数
        type: string
        default: "20"

# 另一个仓库中：
jobs:
  ci:
    uses: 组织/模板仓库/.github/workflows/ci.yml@main
    with:
      node-version: "22"
```

---

## 12. 第 9 课：生产级 CI/CD

**文件**: `.github/workflows/09-production-pipeline.yml`

完整流水线的五个阶段：

```
CI（lint + test）
  → 兼容性测试（矩阵：3 个 Node 版本）
    → Build（Docker 构建 + 推送镜像）
      → Deploy Staging（需要环境审批）
      → Deploy Production（需要环境审批）
        → Notify（汇总所有结果）
```

这条流水线可以直接作为你项目的起点，根据实际需求裁剪。

---

## 13. 常见问题排查

### 流水线不触发？

1. 确认文件在 `.github/workflows/` 目录下
2. 确认文件后缀是 `.yml` 或 `.yaml`
3. 确认 `on:` 的事件类型和你做的操作匹配
4. 检查是否被 GitHub 的速率限制

### 流水线报红（失败）？

1. 点击失败的 Job → 展开失败的 Step → 查看日志
2. 常见原因：依赖没装好、命令拼错、缺少环境变量、权限不够

### Secrets 不生效？

1. Secret 名区分大小写
2. 确认 Secret 在对应层级设置（Repository / Environment）
3. fork 仓库的 PR 默认无法访问上游仓库的 Secrets

### YAML 语法报错？

1. 检查缩进（YAML 用空格，不用 Tab）
2. 检查 `${{ }}` 里是否有未定义的变量
3. 在线工具验证：把 YAML 粘贴到 https://www.yamllint.com/

---

## 14. 学习路线图

```
入门（1-2 天）
  ├─ 理解 CI/CD 概念
  ├─ 跑通 Hello World 流水线
  ├─ 学会用 checkout + setup-node
  └─ 跑通 lint + test 流程

进阶（2-3 天）
  ├─ 掌握矩阵构建
  ├─ 学会缓存加速
  ├─ 理解 Artifacts 和 Outputs
  └─ 配置 Secrets 和 Variables

高级（3-5 天）
  ├─ Docker 构建 + 推送
  ├─ Environment 环境 + 审批流程
  ├─ 可复用工作流
  └─ 设计自己的生产级流水线

实战方向
  ├─ 部署到云服务（AWS / Azure / Vercel）
  ├─ 集成通知（Slack / 钉钉 / 飞书）
  ├─ 语义化版本发布（Release Please / Changesets）
  ├─ Monorepo 的 CI/CD 策略
  └─ 自托管 Runner
```

---

## 本项目文件结构

```
git_action/
├── TUTORIAL.md                          ← 本教程（你在看这个）
├── package.json                         ← 示例 Node.js 项目配置
├── Dockerfile                           ← 示例 Docker 构建文件
├── src/
│   ├── index.js                         ← 示例业务代码
│   ├── index.test.js                    ← 示例测试代码
│   └── lint.js                          ← 简易代码规范检查
└── .github/workflows/
    ├── 01-hello-world.yml               ← 入门：第一个流水线
    ├── 02-triggers-and-context.yml      ← 入门：触发器和上下文
    ├── 03-build-and-test.yml            ← 实战：CI 构建+测试
    ├── 04-matrix-and-cache.yml          ← 进阶：矩阵和缓存
    ├── 05-artifacts-and-outputs.yml     ← 进阶：Job 间数据传递
    ├── 06-secrets-and-environments.yml  ← 进阶：密钥和环境
    ├── 07-docker.yml                    ← 高级：Docker 集成
    ├── 08-reusable-workflows.yml        ← 高级：可复用工作流
    └── 09-production-pipeline.yml       ← 高级：生产级 CI/CD
```

---

## 下一步建议

1. **fork 这个仓库**，然后把自己 fork 的版本推送到 GitHub
2. 按顺序从 `01` 到 `09`，逐个读 `.yml` 文件的注释并观察运行结果
3. 尝试修改触发器、添加新的步骤、故意写错测试看流水线变红
4. 等你理解了全部 9 个文件，就可以在自己的真实项目里搭建 CI/CD 了

> **最重要的建议**: 不要一次读完。每天搞懂 1-2 个 `.yml` 文件，push 上去看效果，改一改再跑。动手比阅读重要 10 倍。
