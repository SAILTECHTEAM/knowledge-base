# Git Hooks 完全指南

## 目录
1. [Git Hooks 简介](#git-hooks-简介)
2. [原生 Git Hooks](#原生-git-hooks)
3. [Husky - 现代 Git Hooks 管理](#husky---现代-git-hooks-管理)
4. [Commitizen - 标准化提交信息](#commitizen---标准化提交信息)
5. [Pre-commit 框架](#pre-commit-框架)
6. [环境特定设置](#环境特定设置)
7. [高级 Hook 配置](#高级-hook-配置)
8. [最佳实践与故障排除](#最佳实践与故障排除)

---

## Git Hooks 简介

### 什么是 Git Hooks？

Git hooks 是 Git 在特定事件（如 commit、push、receive）前后自动执行的脚本。它们允许你自动化任务、强制执行标准，并自定义 Git 行为。

### 为什么使用 Git Hooks？

| 优势 | 描述 | 示例 |
|------|------|------|
| **代码质量** | 自动运行 linter 和格式化工具 | 在每次提交前运行 ESLint |
| **测试** | 确保测试通过后再提交 | 在 pre-commit 时运行单元测试 |
| **安全** | 防止敏感数据被提交 | 检查密钥/API 密钥 |
| **一致性** | 强制执行提交信息标准 | 验证约定式提交 |
| **自动化** | 自动化重复性任务 | 在打标签时更新版本号 |

### Hook 分类

| 类别 | Hooks | 用途 |
|------|-------|------|
| **客户端** | pre-commit, commit-msg, pre-push | 本地开发者工作流 |
| **服务端** | pre-receive, post-receive, update | 仓库管理 |
| **邮件** | applypatch-msg, post-applypatch | 补丁工作流 |

---

## 原生 Git Hooks

### Hook 位置

```bash
# 本地仓库 hooks
.git/hooks/

# 全局 hooks（应用于所有仓库）
~/.git/hooks/

# 系统级 hooks
/etc/git/hooks/
```

### 可用的客户端 Hooks

| Hook | 运行时机 | 常见用例 |
|------|----------|----------|
| `pre-commit` | 在输入提交信息前 | Linting、格式化、基本验证 |
| `prepare-commit-msg` | 在提交信息编辑器打开前 | 默认提交信息、模板 |
| `commit-msg` | 在提交信息保存后 | 验证提交信息格式 |
| `post-commit` | 在提交创建后 | 通知、日志记录 |
| `pre-push` | 在 push 后但发送到远程前 | 运行测试、检查分支保护 |
| `post-push` | 在成功 push 后 | 通知、部署触发器 |
| `pre-rebase` | 在 rebase 开始前 | 检查 rebase 是否安全 |
| `post-checkout` | 在 checkout 后 | 设置环境、安装依赖 |
| `post-merge` | 在 merge 后 | 更新依赖、清理 |

### 创建基础 Pre-commit Hook

```bash
# 导航到 hooks 目录
cd .git/hooks/

# 创建 pre-commit hook 文件
touch pre-commit
chmod +x pre-commit

# 编辑 hook
nano pre-commit
```

**示例 Pre-commit Hook：**
```bash
#!/bin/sh

# 遇到错误时退出
set -e

echo "运行 pre-commit 检查..."

# 为 JavaScript/TypeScript 文件运行 ESLint
if command -v eslint >/dev/null 2>&1; then
    eslint . --ext .js,.jsx,.ts,.tsx
    echo "✓ ESLint 检查通过"
fi

# 运行 Python linting
if command -v flake8 >/dev/null 2>&1; then
    flake8 *.py
    echo "✓ Python linting 通过"
fi

# 检查常见安全问题
if grep -r "password\|secret\|api_key\|token" --include="*.js" --include="*.py" --include="*.json" .; then
    echo "❌ 在代码中发现潜在的密钥！"
    exit 1
fi

echo "✓ 所有 pre-commit 检查通过"
exit 0
```

### 提交信息验证 Hook

```bash
#!/bin/sh

# .git/hooks/commit-msg
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "无效的提交信息格式！"
    echo "期望格式：<type>(<scope>): <subject>"
    echo "类型：feat, fix, docs, style, refactor, test, chore"
    echo "示例：feat(auth): 添加 JWT 令牌验证"
    exit 1
fi

echo "✓ 提交信息格式有效"
exit 0
```

### Pre-push Hook 示例

```bash
#!/bin/sh

# .git/hooks/pre-push
echo "运行 pre-push 检查..."

# 运行测试
if command -v npm >/dev/null 2>&1; then
    npm test
elif command -v pytest >/dev/null 2>&1; then
    pytest
fi

# 检查是否推送到 main/master
current_branch=$(git rev-parse --abbrev-ref HEAD)
protected_branches="main master develop"

if echo "$protected_branches" | grep -q "$current_branch"; then
    echo "⚠️  推送到受保护分支：$current_branch"
    read -p "确定吗？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Pre-push 检查通过"
exit 0
```

---

## Husky - 现代 Git Hooks 管理

### 为什么使用 Husky？

| 原生 Hooks | Husky |
|------------|-------|
| 手动设置 | 自动安装 |
| 不受版本控制 | 与团队共享 |
| 平台特定 | 跨平台 |
| 难以维护 | 易于更新 |

### 安装

```bash
# 安装 Husky
npm install husky --save-dev

# 启用 Git hooks
npx husky install

# 在 package.json 中添加 prepare 脚本
npm pkg set scripts.prepare="husky install"
```

### 基础配置

**package.json:**
```json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint .",
    "test": "jest",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "husky": "^8.0.3"
  }
}
```

### 添加 Hooks

```bash
# 添加 pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# 添加 commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit"

# 添加 pre-push hook
npx husky add .husky/pre-push "npm test"
```

### Husky Hook 示例

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行 linting
npm run lint

# 运行格式化检查
npm run format -- --check

# 运行类型检查
npm run type-check
```

**.husky/commit-msg:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit ${1}
```

**.husky/pre-push:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行测试
npm run test:coverage

# 检查构建
npm run build
```

### Husky 与 Yarn

```bash
# Yarn 2+
yarn add husky --dev
yarn husky install

# 添加 hooks
yarn husky add .husky/pre-commit "yarn lint"
yarn husky add .husky/commit-msg "yarn commitlint --edit"
```

---

## Commitizen - 标准化提交信息

### 什么是 Commitizen？

Commitizen 帮助你编写符合约定式提交规范的标准提交信息。

### 安装

```bash
# 安装 Commitizen 和约定式提交适配器
npm install commitizen cz-conventional-changelog --save-dev

# 配置 package.json
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"
```

### 基础用法

```bash
# 交互式提交
npm run commit

# 或使用 cz 命令
npx cz
```

### Commitizen 配置

**package.json:**
```json
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog",
      "types": {
        "feat": {
          "description": "新功能",
          "title": "功能"
        },
        "fix": {
          "description": "修复 bug",
          "title": "修复"
        },
        "docs": {
          "description": "仅文档更改",
          "title": "文档"
        },
        "style": {
          "description": "不影响代码含义的更改",
          "title": "样式"
        },
        "refactor": {
          "description": "既不修复 bug 也不添加功能的代码更改",
          "title": "重构"
        },
        "test": {
          "description": "添加缺失测试或更正现有测试",
          "title": "测试"
        },
        "chore": {
          "description": "维护任务",
          "title": "杂务"
        }
      }
    }
  }
}
```

### Commitlint 集成

```bash
# 安装 commitlint
npm install @commitlint/cli @commitlint/config-conventional --save-dev

# 创建 commitlint 配置
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

**commitlint.config.js:**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 bug
        'docs',     // 文档
        'style',    // 代码风格
        'refactor', // 重构
        'test',     // 测试
        'chore',    // 维护
        'perf',     // 性能
        'ci',       // CI 配置
        'build',    // 构建系统
        'revert'    // 撤销更改
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

---

## Pre-commit 框架

### 什么是 Pre-commit？

Pre-commit 是一个用于管理和维护多语言 pre-commit hooks 的框架。

### 安装

```bash
# 安装 pre-commit
pip install pre-commit

# 创建 pre-commit 配置
touch .pre-commit-config.yaml
```

### 基础配置

**.pre-commit-config.yaml:**
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.40.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        types: [file]
```

### 安装 Hooks

```bash
# 为当前仓库安装 hooks
pre-commit install

# 为所有仓库安装 hooks
pre-commit install --install-hooks

# 手动在所有文件上运行 hooks
pre-commit run --all-files

# 运行特定 hook
pre-commit run trailing-whitespace --all-files
```

### 语言特定 Hooks

#### Python 项目示例

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: ["--profile", "black"]

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=88, --extend-ignore=E203]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
```

#### JavaScript/TypeScript 项目示例

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: check-json
      - id: check-yaml
      - id: check-merge-conflict
      - id: end-of-file-fixer

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.40.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
        types: [file]

  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v3.0.0-alpha.4
    hooks:
      - id: prettier
        types_or: [javascript, jsx, ts, tsx, json, yaml, markdown]

  - repo: https://github.com/pre-commit/mirrors-stylelint
    rev: v15.6.2
    hooks:
      - id: stylelint
        files: \.(css|scss|less)$
```

---

## 环境特定设置

### Node.js/npm 环境

#### 使用 Husky 的完整设置

```bash
# 1. 安装依赖
npm install husky commitizen @commitlint/cli @commitlint/config-conventional --save-dev

# 2. 初始化 Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 3. 配置 commitizen
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"

# 4. 添加 hooks
npx husky add .husky/pre-commit "npm run lint && npm run test"
npx husky add .husky/commit-msg "npx commitlint --edit"

# 5. 创建 commitlint 配置
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
```

**package.json 示例：**
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "prepare": "husky install",
    "commit": "git-cz",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@commitlint/cli": "^17.6.3",
    "@commitlint/config-conventional": "^17.6.3",
    "commitizen": "^4.3.0",
    "cz-conventional-changelog": "^3.3.0",
    "eslint": "^8.41.0",
    "husky": "^8.0.3",
    "jest": "^29.5.0",
    "typescript": "^5.0.4"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

### Python 环境

#### Pre-commit 设置

```bash
# 1. 安装 pre-commit
pip install pre-commit

# 2. 创建 .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: debug-statements

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3

  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: ["--profile", "black"]

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: [--max-line-length=88, --extend-ignore=E203]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
EOF

# 3. 安装 hooks
pre-commit install
```

#### Python 的原生 Git Hooks

```bash
# 创建 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "运行 Python pre-commit 检查..."

# 运行 black 格式化检查
if command -v black >/dev/null 2>&1; then
    black --check .
    echo "✓ Black 格式化检查通过"
fi

# 运行 isort 导入排序检查
if command -v isort >/dev/null 2>&1; then
    isort --check-only .
    echo "✓ 导入排序检查通过"
fi

# 运行 flake8 linting
if command -v flake8 >/dev/null 2>&1; then
    flake8 .
    echo "✓ Flake8 linting 通过"
fi

# 运行 mypy 类型检查
if command -v mypy >/dev/null 2>&1; then
    mypy .
    echo "✓ MyPy 类型检查通过"
fi

# 运行测试
if command -v pytest >/dev/null 2>&1; then
    pytest
    echo "✓ 测试通过"
fi

echo "✓ 所有 pre-commit 检查通过"
EOF

chmod +x .git/hooks/pre-commit
```

### C++ 环境

#### Pre-commit 配置

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict

  - repo: https://github.com/pocc/pre-commit-hooks
    rev: v1.3.5
    hooks:
      - id: clang-format
        args: [--style=file]
      - id: cppcheck
        args: [--enable=all, --suppress=missingIncludeSystem]
      - id: cpplint

  - repo: local
    hooks:
      - id: cmake-format
        name: cmake-format
        entry: cmake-format
        language: system
        files: \.cmake$|CMakeLists\.txt$
        args: [-i]
```

#### C++ 的原生 Git Hooks

```bash
# 创建 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "运行 C++ pre-commit 检查..."

# 运行 clang-format
if command -v clang-format >/dev/null 2>&1; then
    find . -name "*.cpp" -o -name "*.h" -o -name "*.hpp" | xargs clang-format -i
    echo "✓ 代码已用 clang-format 格式化"
fi

# 运行 cppcheck
if command -v cppcheck >/dev/null 2>&1; then
    cppcheck --enable=all --suppress=missingIncludeSystem --error-exitcode=1 .
    echo "✓ 静态分析通过"
fi

# 构建项目
if [ -f "CMakeLists.txt" ]; then
    mkdir -p build
    cd build
    cmake ..
    make
    cd ..
    echo "✓ 构建成功"
fi

# 运行测试
if [ -f "build/tests" ]; then
    ./build/tests
    echo "✓ 测试通过"
fi

echo "✓ 所有 pre-commit 检查通过"
EOF

chmod +x .git/hooks/pre-commit
```

---

## 高级 Hook 配置

### 多阶段验证流水线

```bash
#!/bin/bash
# .husky/pre-commit

set -e

echo "🚀 开始 pre-commit 验证流水线..."

# 阶段 1：快速检查（快速失败）
echo "📋 阶段 1：快速验证检查"
npm run lint:fix || {
    echo "❌ Linting 失败"
    exit 1
}

# 阶段 2：类型检查
echo "🔍 阶段 2：类型检查"
npm run type-check || {
    echo "❌ 类型检查失败"
    exit 1
}

# 阶段 3：单元测试
echo "🧪 阶段 3：运行单元测试"
npm run test:unit || {
    echo "❌ 单元测试失败"
    exit 1
}

# 阶段 4：构建验证
echo "🏗️  阶段 4：构建验证"
npm run build || {
    echo "❌ 构建失败"
    exit 1
}

# 阶段 5：安全扫描
echo "🔒 阶段 5：安全扫描"
npm audit --audit-level moderate || {
    echo "⚠️  发现安全漏洞"
    read -p "仍然继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo "✅ 所有验证阶段通过！"
```

### 条件 Hooks

```bash
#!/bin/bash
# .husky/pre-push

set -e

# 获取当前分支
current_branch=$(git rev-parse --abbrev-ref HEAD)

# 不同分支的不同检查
case $current_branch in
    "main"|"master")
        echo "🔒 推送到 main 分支 - 运行完整套件"
        npm run test:integration
        npm run test:e2e
        ;;
    "develop")
        echo "🚀 推送到 develop 分支 - 运行标准测试"
        npm run test:unit
        npm run test:integration
        ;;
    *)
        echo "🔧 功能分支 - 运行基本检查"
        npm run test:unit
        ;;
esac

# 检查 package.json 是否更改
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
    echo "📦 package.json 已更改 - 运行 npm audit"
    npm audit --audit-level moderate
fi

echo "✅ Pre-push 检查完成"
```

### 自定义 Hook 工具

```bash
#!/bin/bash
# scripts/git-hooks-utils.sh

# 输出颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

# 工具函数
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 运行命令并处理错误
run_command() {
    local cmd="$1"
    local description="$2"
    
    log_info "运行：$description"
    if eval "$cmd"; then
        log_info "✓ $description 成功完成"
        return 0
    else
        log_error "✗ $description 失败"
        return 1
    fi
}

# 检查特定类型的更改文件
check_changed_files() {
    local extension="$1"
    git diff --cached --name-only | grep -q "\.$extension$"
}

# 在 pre-commit hook 中的使用示例
#!/bin/bash
source scripts/git-hooks-utils.sh

if check_changed_files "js"; then
    run_command "npm run lint" "JavaScript linting"
fi

if check_changed_files "py"; then
    run_command "flake8 ." "Python linting"
fi
```

---

## 最佳实践与故障排除

### 最佳实践

| 实践 | 描述 | 实现 |
|------|------|------|
| **版本控制** | 将 hooks 保留在仓库中 | 使用 Husky 或 pre-commit |
| **快速失败** | 先运行快速检查 | 按执行时间排序 hooks |
| **清晰信息** | 提供有用的错误信息 | 使用彩色输出和具体指导 |
| **性能** | 不要不必要地阻塞开发者 | 缓存结果，只运行相关检查 |
| **文档** | 记录 hook 目的 | 注释 hooks，维护 README |

### Hook 性能优化

```bash
#!/bin/bash
# 优化的 pre-commit hook

# 只对暂存文件运行检查
STAGED_JS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
STAGED_PY=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$')

# 只暂存了 JS 文件时运行 JavaScript 检查
if [ -n "$STAGED_JS" ]; then
    echo "📝 运行 JavaScript 检查..."
    echo "$STAGED_JS" | xargs eslint
fi

# 只暂存了 Python 文件时运行 Python 检查
if [ -n "$STAGED_PY" ]; then
    echo "🐍 运行 Python 检查..."
    echo "$STAGED_PY" | xargs flake8
fi
```

### 常见问题与解决方案

#### 问题 1：Hooks 不执行

```bash
# 检查 hooks 是否可执行
ls -la .git/hooks/

# 使 hooks 可执行
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg

# 对于 Husky，检查安装
npx husky install
```

#### 问题 2：Hook 权限

```bash
# 修复 hook 权限
find .git/hooks -type f -name "*" -exec chmod +x {} \;

# 对于 pre-commit 框架
pre-commit install --install-hooks
```

#### 问题 3：Hook 超时

```bash
# 为 hooks 添加超时
#!/bin/bash
timeout 300 npm test  # 5 分钟超时
if [ $? -eq 124 ]; then
    echo "❌ 测试在 5 分钟后超时"
    exit 1
fi
```

#### 问题 4：跳过 Hooks

```bash
# 跳过 hooks（谨慎使用）
git commit --no-verify
git push --no-verify

# 更好的方法：绕过特定检查
SKIP_LINT=true git commit
```

### 调试 Hooks

```bash
# 启用调试模式
export HUSKY_DEBUG=1
git commit

# 手动测试 hooks
./.git/hooks/pre-commit

# 对于 pre-commit 框架
pre-commit run --all-files --verbose
```

### 团队协作

#### 与团队共享 Hooks

```bash
# 1. 添加到 package.json（Husky）
{
  "scripts": {
    "postinstall": "husky install"
  }
}

# 2. 添加到 .pre-commit-config.yaml（pre-commit）
# 文件自动受版本控制

# 3. 在 README 中记录
echo "## 开发设置

1. 克隆仓库
2. 安装依赖：npm install
3. 安装 hooks：npm run prepare
4. 验证：pre-commit run --all-files" >> README.md
```

#### 逐步采用

```bash
# 从基本 hooks 开始
npx husky add .husky/pre-commit "npm run lint"

# 逐步添加更多检查
npx husky add .husky/pre-commit "npm run lint && npm run test"

# 添加提交信息验证
npx husky add .husky/commit-msg "npx commitlint --edit"
```

---

## 完整示例项目

### Node.js 项目设置

```bash
#!/bin/bash
# setup-hooks.sh

echo "🚀 为 Node.js 项目设置 Git hooks..."

# 安装依赖
npm install --save-dev \
    husky \
    @commitlint/cli \
    @commitlint/config-conventional \
    commitizen \
    cz-conventional-changelog \
    eslint \
    prettier \
    jest

# 初始化 Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 配置 commitizen
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"

# 添加 hooks
npx husky add .husky/pre-commit "npm run lint:fix && npm run test"
npx husky add .husky/commit-msg "npx commitlint --edit"

# 创建 commitlint 配置
cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
EOF

echo "✅ Git hooks 设置完成！"
```

### Python 项目设置

```bash
#!/bin/bash
# setup-python-hooks.sh

echo "🐍 为 Python 项目设置 Git hooks..."

# 安装 pre-commit
pip install pre-commit

# 创建 pre-commit 配置
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
EOF

# 安装 hooks
pre-commit install

echo "✅ Python Git hooks 设置完成！"
```

---

## 资源与延伸阅读

### 官方文档
- [Git Hooks 文档](https://git-scm.com/book/zh/v2/自定义-Git-Git-钩子)
- [Husky 文档](https://typicode.github.io/husky/)
- [Commitizen 文档](https://commitizen-tools.github.io/commitizen/)
- [Pre-commit 框架](https://pre-commit.com/)

### 配置示例
- [Awesome Git Hooks](https://github.com/AGhost-7/awesome-git-hooks)
- [约定式提交](https://www.conventionalcommits.org/zh-hans/)
- [ESLint 配置](https://eslint.org/docs/user-guide/configuring)

### 工具与集成
- [Commitlint](https://commitlint.js.org/)
- [Lint-staged](https://github.com/okonet/lint-staged)
- [Semantic Release](https://semantic-release.gitbook.io/)

---

*最后更新：2025年12月*