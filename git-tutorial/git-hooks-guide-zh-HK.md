# Git Hooks 完整指南

## 目錄
1. [Git Hooks 簡介](#git-hooks-簡介)
2. [原生 Git Hooks](#原生-git-hooks)
3. [Husky - 現代 Git Hooks 管理](#husky---現代-git-hooks-管理)
4. [Commitizen - 標準化提交訊息](#commitizen---標準化提交訊息)
5. [Pre-commit 框架](#pre-commit-框架)
6. [環境特定設定](#環境特定設定)
7. [進階 Hook 設定](#進階-hook-設定)
8. [最佳實踐與故障排除](#最佳實踐與故障排除)

---

## Git Hooks 簡介

### 什麼是 Git Hooks？

Git hooks 是 Git 在特定事件（如 commit、push、receive）前後自動執行的腳本。它們讓你可以自動化工作、強制執行標準，並自訂 Git 行為。

### 為何使用 Git Hooks？

| 優點 | 描述 | 範例 |
|------|------|------|
| **程式碼品質** | 自動執行 linter 和格式化工具 | 在每次提交前執行 ESLint |
| **測試** | 確保測試通過後才提交 | pre-commit 時執行單元測試 |
| **安全性** | 防止敏感資料被提交 | 檢查 secrets/API keys |
| **一致性** | 強制提交訊息標準 | 驗證 Conventional Commits |
| **自動化** | 自動化重複性工作 | 打 tag 時更新版本號 |

### Hook 分類

| 類別 | Hooks | 用途 |
|------|-------|------|
| **客戶端** | pre-commit, commit-msg, pre-push | 本地開發者工作流程 |
| **伺服端** | pre-receive, post-receive, update | 儲存庫管理 |
| **郵件** | applypatch-msg, post-applypatch | 補丁流程 |

---

## 原生 Git Hooks

### Hook 存放位置

```bash
# 本地儲存庫 hooks
.git/hooks/

# 全域 hooks（應用於所有儲存庫）
~/.git/hooks/

# 系統層級 hooks
/etc/git/hooks/
```

### 常見的客戶端 Hooks

| Hook | 執行時機 | 常見用途 |
|------|----------|----------|
| `pre-commit` | 輸入提交訊息前 | Lint、格式化、基本驗證 |
| `prepare-commit-msg` | 開啟提交訊息編輯器前 | 預設訊息、範本 |
| `commit-msg` | 儲存提交訊息後 | 驗證提交訊息格式 |
| `post-commit` | 建立提交後 | 通知、日誌 |
| `pre-push` | push 前 | 執行測試、檢查分支保護 |
| `post-push` | 成功 push 後 | 通知、部署觸發器 |
| `pre-rebase` | rebase 開始前 | 檢查 rebase 是否安全 |
| `post-checkout` | checkout 後 | 設定環境、安裝依賴 |
| `post-merge` | merge 後 | 更新依賴、清理 |

### 建立基本的 pre-commit Hook

```bash
# 進入 hooks 目錄
cd .git/hooks/

# 建立 pre-commit hook 檔案
touch pre-commit
chmod +x pre-commit

# 編輯 hook
nano pre-commit
```

**pre-commit 範例：**
```bash
#!/bin/sh

# 遇錯即停
set -e

echo "執行 pre-commit 檢查..."

# 執行 JavaScript/TypeScript ESLint
if command -v eslint >/dev/null 2>&1; then
    eslint . --ext .js,.jsx,.ts,.tsx
    echo "✓ ESLint 檢查通過"
fi

# 執行 Python lint
if command -v flake8 >/dev/null 2>&1; then
    flake8 *.py
    echo "✓ Python lint 通過"
fi

# 檢查常見安全問題
if grep -r "password\|secret\|api_key\|token" --include="*.js" --include="*.py" --include="*.json" .; then
    echo "❌ 偵測到潛在敏感資訊！"
    exit 1
fi

echo "✓ 所有 pre-commit 檢查通過"
exit 0
```

### Commit 訊息驗證 Hook

```bash
#!/bin/sh

# .git/hooks/commit-msg
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "無效的提交訊息格式！"
    echo "預期格式：<type>(<scope>): <subject>"
    echo "類型：feat, fix, docs, style, refactor, test, chore"
    echo "範例：feat(auth): add JWT token validation"
    exit 1
fi

echo "✓ Commit 訊息格式正確"
exit 0
```

### Pre-push Hook 範例

```bash
#!/bin/sh

# .git/hooks/pre-push
echo "執行 pre-push 檢查..."

# 執行測試
if command -v npm >/dev/null 2>&1; then
    npm test
elif command -v pytest >/dev/null 2>&1; then
    pytest
fi

# 檢查是否推送到 main/master/develop
current_branch=$(git rev-parse --abbrev-ref HEAD)
protected_branches="main master develop"

if echo "$protected_branches" | grep -q "$current_branch"; then
    echo "⚠️  正在推送至受保護分支：$current_branch"
    read -p "確定要繼續嗎？ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Pre-push 檢查通過"
exit 0
```

---

## Husky - 現代 Git Hooks 管理

### 為何使用 Husky？

| 原生 Hooks | Husky |
|------------|-------|
| 手動設定 | 自動安裝 |
| 不受版本控制 | 團隊共用 |
| 平台特定 | 跨平台 |
| 難以維護 | 易於更新 |

### 安裝

```bash
# 安裝 Husky
npm install husky --save-dev

# 啟用 Git hooks
npx husky install

# 在 package.json 加入 prepare 腳本
npm pkg set scripts.prepare="husky install"
```

### 基本設定

**package.json 範例：**
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

### 新增 Hooks

```bash
# 新增 pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# 新增 commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit"

# 新增 pre-push hook
npx husky add .husky/pre-push "npm test"
```

### Husky Hook 範例

**.husky/pre-commit：**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 執行 lint
npm run lint

# 格式檢查
npm run format -- --check

# 型別檢查
npm run type-check
```

**.husky/commit-msg：**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install commitlint --edit ${1}
```

**.husky/pre-push：**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 執行測試
npm run test:coverage

# 檢查建置
npm run build
```

### Husky 與 Yarn

```bash
# Yarn 2+
yarn add husky --dev
yarn husky install

# 新增 hooks
yarn husky add .husky/pre-commit "yarn lint"
yarn husky add .husky/commit-msg "yarn commitlint --edit"
```

---

## Commitizen - 標準化提交訊息

### 什麼是 Commitizen？

Commitizen 幫助你撰寫符合 Conventional Commits 標準的提交訊息。

### 安裝

```bash
# 安裝 Commitizen 及 conventional commits adapter
npm install commitizen cz-conventional-changelog --save-dev

# 設定 package.json
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"
```

### 基本用法

```bash
# 互動式提交
npm run commit

# 或使用 cz 指令
npx cz
```

### Commitizen 設定

**package.json 範例：**
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
          "description": "修復 bug",
          "title": "修復"
        },
        "docs": {
          "description": "僅文檔更改",
          "title": "文檔"
        },
        "style": {
          "description": "不影響程式邏輯的格式調整",
          "title": "樣式"
        },
        "refactor": {
          "description": "重構（非修 bug 或新功能）",
          "title": "重構"
        },
        "test": {
          "description": "新增或修正測試",
          "title": "測試"
        },
        "chore": {
          "description": "維護性工作",
          "title": "雜項"
        }
      }
    }
  }
}
```

### Commitlint 整合

```bash
# 安裝 commitlint
npm install @commitlint/cli @commitlint/config-conventional --save-dev

# 建立 commitlint 設定
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

**commitlint.config.js 範例：**
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修復
        'docs',     // 文檔
        'style',    // 樣式
        'refactor', // 重構
        'test',     // 測試
        'chore',    // 雜項
        'perf',     // 效能
        'ci',       // CI 設定
        'build',    // 建置
        'revert'    // 回復
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

---

## Pre-commit 框架

### 什麼是 Pre-commit？

Pre-commit 是一個管理多語言 pre-commit hooks 的框架。

### 安裝

```bash
# 安裝 pre-commit
pip install pre-commit

# 建立 pre-commit 設定
touch .pre-commit-config.yaml
```

### 基本設定

**.pre-commit-config.yaml 範例：**
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

### 安裝 Hooks

```bash
# 安裝 hooks 至目前儲存庫
pre-commit install

# 安裝 hooks 至所有儲存庫
pre-commit install --install-hooks

# 手動執行所有 hooks
pre-commit run --all-files

# 執行特定 hook
pre-commit run trailing-whitespace --all-files
```

### 語言特定 Hooks

#### Python 專案範例

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

#### JavaScript/TypeScript 專案範例

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

## 環境特定設定

### Node.js/npm 環境

#### Husky 完整設定

```bash
# 1. 安裝依賴
npm install husky commitizen @commitlint/cli @commitlint/config-conventional --save-dev

# 2. 初始化 Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 3. 設定 commitizen
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"

# 4. 新增 hooks
npx husky add .husky/pre-commit "npm run lint && npm run test"
npx husky add .husky/commit-msg "npx commitlint --edit"

# 5. 建立 commitlint 設定
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
```

**package.json 範例：**
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

### Python 環境

#### Pre-commit 設定

```bash
# 1. 安裝 pre-commit
pip install pre-commit

# 2. 建立 .pre-commit-config.yaml
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

# 3. 安裝 hooks
pre-commit install
```

#### Python 原生 Git Hooks

```bash
# 建立 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "執行 Python pre-commit 檢查..."

# black 格式檢查
if command -v black >/dev/null 2>&1; then
    black --check .
    echo "✓ Black 格式檢查通過"
fi

# isort 匯入排序檢查
if command -v isort >/dev/null 2>&1; then
    isort --check-only .
    echo "✓ 匯入排序檢查通過"
fi

# flake8 lint
if command -v flake8 >/dev/null 2>&1; then
    flake8 .
    echo "✓ Flake8 lint 通過"
fi

# mypy 型別檢查
if command -v mypy >/dev/null 2>&1; then
    mypy .
    echo "✓ MyPy 型別檢查通過"
fi

# 執行測試
if command -v pytest >/dev/null 2>&1; then
    pytest
    echo "✓ 測試通過"
fi

echo "✓ 所有 pre-commit 檢查通過"
EOF

chmod +x .git/hooks/pre-commit
```

### C++ 環境

#### Pre-commit 設定

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

#### C++ 原生 Git Hooks

```bash
# 建立 pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "執行 C++ pre-commit 檢查..."

# clang-format
if command -v clang-format >/dev/null 2>&1; then
    find . -name "*.cpp" -o -name "*.h" -o -name "*.hpp" | xargs clang-format -i
    echo "✓ 已用 clang-format 格式化"
fi

# cppcheck
if command -v cppcheck >/dev/null 2>&1; then
    cppcheck --enable=all --suppress=missingIncludeSystem --error-exitcode=1 .
    echo "✓ 靜態分析通過"
fi

# 建置專案
if [ -f "CMakeLists.txt" ]; then
    mkdir -p build
    cd build
    cmake ..
    make
    cd ..
    echo "✓ 建置成功"
fi

# 執行測試
if [ -f "build/tests" ]; then
    ./build/tests
    echo "✓ 測試通過"
fi

echo "✓ 所有 pre-commit 檢查通過"
EOF

chmod +x .git/hooks/pre-commit
```

---

## 進階 Hook 設定

### 多階段驗證流水線

```bash
#!/bin/bash
# .husky/pre-commit

set -e

echo "🚀 開始 pre-commit 驗證流水線..."

# 階段 1：快速檢查（快速失敗）
echo "📋 階段 1：快速驗證檢查"
npm run lint:fix || {
    echo "❌ Linting 失敗"
    exit 1
}

# 階段 2：型別檢查
echo "🔍 階段 2：型別檢查"
npm run type-check || {
    echo "❌ 型別檢查失敗"
    exit 1
}

# 階段 3：單元測試
echo "🧪 階段 3：執行單元測試"
npm run test:unit || {
    echo "❌ 單元測試失敗"
    exit 1
}

# 階段 4：建置驗證
echo "🏗️  階段 4：建置驗證"
npm run build || {
    echo "❌ 建置失敗"
    exit 1
}

# 階段 5：安全掃描
echo "🔒 階段 5：安全掃描"
npm audit --audit-level moderate || {
    echo "⚠️  發現安全漏洞"
    read -p "仍然繼續？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo "✅ 所有驗證階段通過！"
```

### 條件式 Hooks

```bash
#!/bin/bash
# .husky/pre-push

set -e

# 取得目前分支
current_branch=$(git rev-parse --abbrev-ref HEAD)

# 依分支執行不同檢查
case $current_branch in
    "main"|"master")
        echo "🔒 推送到 main 分支 - 執行完整測試"
        npm run test:integration
        npm run test:e2e
        ;;
    "develop")
        echo "🚀 推送到 develop 分支 - 執行標準測試"
        npm run test:unit
        npm run test:integration
        ;;
    *)
        echo "🔧 功能分支 - 執行基本檢查"
        npm run test:unit
        ;;
esac

# 檢查 package.json 是否變更
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
    echo "📦 package.json 已變更 - 執行 npm audit"
    npm audit --audit-level moderate
fi

echo "✅ Pre-push 檢查完成"
```

### 自訂 Hook 工具

```bash
#!/bin/bash
# scripts/git-hooks-utils.sh

# 顏色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # 無顏色

# 工具函式
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 檢查指令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 執行指令並處理錯誤
run_command() {
    local cmd="$1"
    local description="$2"
    
    log_info "執行：$description"
    if eval "$cmd"; then
        log_info "✓ $description 完成"
        return 0
    else
        log_error "✗ $description 失敗"
        return 1
    fi
}

# 檢查暫存檔案副檔名
check_changed_files() {
    local extension="$1"
    git diff --cached --name-only | grep -q "\.$extension$"
}

# pre-commit hook 範例
#!/bin/bash
source scripts/git-hooks-utils.sh

if check_changed_files "js"; then
    run_command "npm run lint" "JavaScript lint"
fi

if check_changed_files "py"; then
    run_command "flake8 ." "Python lint"
fi
```

---

## 最佳實踐與故障排除

### 最佳實踐

| 實踐 | 描述 | 建議做法 |
|------|------|----------|
| **版本控制** | 將 hooks 納入專案 | 使用 Husky 或 pre-commit |
| **快速失敗** | 先執行快速檢查 | 依執行時間排序 hooks |
| **清晰訊息** | 提供有用錯誤訊息 | 用顏色輸出與明確指引 |
| **效能** | 避免不必要阻塞開發 | 快取結果，只跑相關檢查 |
| **文件化** | 記錄 hook 目的 | 註解 hooks，維護 README |

### Hook 效能最佳化

```bash
#!/bin/bash
# 最佳化 pre-commit hook

# 只檢查暫存檔案
STAGED_JS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
STAGED_PY=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$')

# 有 JS 檔才執行 JS 檢查
if [ -n "$STAGED_JS" ]; then
    echo "📝 執行 JavaScript 檢查..."
    echo "$STAGED_JS" | xargs eslint
fi

# 有 Python 檔才執行 Python 檢查
if [ -n "$STAGED_PY" ]; then
    echo "🐍 執行 Python 檢查..."
    echo "$STAGED_PY" | xargs flake8
fi
```

### 常見問題與解法

#### 問題 1：Hooks 未執行

```bash
# 檢查 hooks 是否可執行
ls -la .git/hooks/

# 設定 hooks 可執行權限
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg

# Husky 請確認已安裝
npx husky install
```

#### 問題 2：Hook 權限

```bash
# 修復 hook 權限
find .git/hooks -type f -name "*" -exec chmod +x {} \;

# pre-commit 框架
pre-commit install --install-hooks
```

#### 問題 3：Hook 執行逾時

```bash
# 為 hooks 加入 timeout
#!/bin/bash
timeout 300 npm test  # 5 分鐘 timeout
if [ $? -eq 124 ]; then
    echo "❌ 測試逾時（5 分鐘）"
    exit 1
fi
```

#### 問題 4：跳過 Hooks

```bash
# 跳過 hooks（謹慎使用）
git commit --no-verify
git push --no-verify

# 更佳做法：只跳過特定檢查
SKIP_LINT=true git commit
```

### 除錯 Hooks

```bash
# 啟用 debug 模式
export HUSKY_DEBUG=1
git commit

# 手動執行 hook
./.git/hooks/pre-commit

# pre-commit 框架
pre-commit run --all-files --verbose
```

### 團隊協作

#### 與團隊共用 Hooks

```bash
# 1. package.json 加 postinstall 腳本
{
  "scripts": {
    "postinstall": "husky install"
  }
}

# 2. .pre-commit-config.yaml 版本控管
# 3. README 文件說明安裝與驗證步驟
echo "## 開發環境設定\n\n1. clone 專案\n2. 安裝依賴：npm install\n3. 安裝 hooks：npm run prepare\n4. 驗證：pre-commit run --all-files" >> README.md
```

#### 漸進式導入

```bash
# 先加基本 hooks
npx husky add .husky/pre-commit "npm run lint"

# 逐步加更多檢查
npx husky add .husky/pre-commit "npm run lint && npm run test"

# 加入 commit 訊息驗證
npx husky add .husky/commit-msg "npx commitlint --edit"
```

---

## 完整專案範例

### Node.js 專案設定

```bash
#!/bin/bash
# setup-hooks.sh

echo "🚀 設定 Node.js 專案 Git hooks..."

# 安裝依賴
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

# 設定 commitizen
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"

# 新增 hooks
npx husky add .husky/pre-commit "npm run lint:fix && npm run test"
npx husky add .husky/commit-msg "npx commitlint --edit"

# 建立 commitlint 設定
cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
EOF

echo "✅ Git hooks 設定完成！"
```

### Python 專案設定

```bash
#!/bin/bash
# setup-python-hooks.sh

echo "🐍 設定 Python 專案 Git hooks..."

# 安裝 pre-commit
pip install pre-commit

# 建立 pre-commit 設定
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

# 安裝 hooks
pre-commit install

echo "✅ Python Git hooks 設定完成！"
```

---

## 資源與延伸閱讀

### 官方文件
- [Git Hooks 文件](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Husky 文件](https://typicode.github.io/husky/)
- [Commitizen 文件](https://commitizen-tools.github.io/commitizen/)
- [Pre-commit 框架](https://pre-commit.com/)

### 設定範例
- [Awesome Git Hooks](https://github.com/AGhost-7/awesome-git-hooks)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint 設定](https://eslint.org/docs/user-guide/configuring)

### 工具與整合
- [Commitlint](https://commitlint.js.org/)
- [Lint-staged](https://github.com/okonet/lint-staged)
- [Semantic Release](https://semantic-release.gitbook.io/)

---

*最後更新：2025年12月*
