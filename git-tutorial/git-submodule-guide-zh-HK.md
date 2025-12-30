# Git 子模組完整指南

## 目錄
1. [什麼是 Git 子模組](#什麼是-git-子模組)
2. [子模組基礎操作](#子模組基礎操作)
3. [進階子模組管理](#進階子模組管理)
4. [工作流程策略](#工作流程策略)
5. [與子模組協作](#與子模組協作)
6. [疑難排解與最佳實踐](#疑難排解與最佳實踐)
7. [替代方案](#替代方案)
8. [實際範例](#實際範例)

---

## 什麼是 Git 子模組

### Git 子模組是什麼？

Git 子模組允許你將一個 Git 倉庫作為另一個 Git 倉庫的子目錄來管理。這使你可以在主專案中包含並追蹤外部倉庫，同時獨立保留它們的版本歷史。

### 為何使用子模組？

| 用例 | 描述 | 範例 |
|------|------|------|
| 函式庫依賴 | 包含第三方函式庫的特定版本 | 將 UI 框架或工具庫作為子模組 |
| 元件重用 | 在多個專案間共享共用元件 | 共用的認證模組 |
| 文件整合 | 包含外部文件倉庫 | 來自其他倉庫的 API 文件 |
| 微服務組織 | 在單一倉庫中組織相關服務 | 多個服務的專案 |
| 外掛系統 | 將外掛作為獨立倉庫管理 | WordPress 外掛、VS Code 擴充套件 |

### 子模組與其他方案之比較

| 方法 | 優點 | 缺點 | 適用情境 |
|------|------|------|---------|
| 子模組 | 保留版本控制、獨立歷史、可選擇更新 | 工作流程較為複雜、需手動更新 | 外部依賴需固定版本 |
| Git subtree | 歷史合併在主倉庫、單一倉庫管理較簡單 | 倉庫變大、無法獨立更新 | 內部元件、緊耦合集成 |
| 套件管理工具 | 自動更新、依賴解析 | 通常不保留原始碼版本控制 | 語言生態系的套件（npm/pip 等） |
| Monorepo 工具 | 高度自動化與功能 | 設定複雜、學習成本高 | 大型組織、多專案管理 |

---

## 子模組基礎操作

### 新增子模組

| 指令 | 選項 | 用途 | 何時使用 |
|------|------|------|---------|
| `git submodule add <url>` | - | 在預設路徑新增子模組 | 基本新增場景 |
| `git submodule add <url> <path>` | - | 在指定路徑新增子模組 | 自訂目錄結構 |
| `git submodule add -b <branch> <url>` | - | 追蹤特定分支 | 需追蹤開發分支 |
| `git submodule add --depth 1 <url>` | - | 浅層克隆子模組 | 子模組很大、希望加速初始化 |

**基本用法：**
```bash
# 在預設路徑（倉庫名稱）新增子模組
git submodule add https://github.com/user/library.git

# 在指定目錄新增子模組
git submodule add https://github.com/user/library.git libs/library

# 追蹤特定分支
git submodule add -b main https://github.com/user/library.git

# 使用淺層克隆（更快、歷史更少）
git submodule add --depth 1 https://github.com/user/library.git
```

### 克隆含子模組的倉庫

| 指令 | 選項 | 用途 | 何時使用 |
|------|------|------|---------|
| `git clone --recurse-submodules <url>` | - | 同時克隆主倉庫與所有子模組 | 專案初次取得 |
| `git clone <url> && git submodule update --init --recursive` | - | 手動兩步驟克隆 | 需要較高控制度的初始化 |
| `git clone --depth 1 --recurse-submodules <url>` | - | 浅層克隆並初始化子模組 | 大型專案的快速設定 |

**克隆流程：**
```bash
# 方法1：一步完成克隆並初始化子模組
git clone --recurse-submodules https://github.com/user/project.git
cd project

# 方法2：兩步驟克隆（更可控）
git clone https://github.com/user/project.git
cd project
git submodule update --init --recursive

# 方法3：浅層克隆並初始化子模組
git clone --depth 1 --recurse-submodules https://github.com/user/project.git
```

### 更新子模組

| 指令 | 選項 | 用途 | 何時使用 |
|------|------|------|---------|
| `git submodule update` | - | 將子模組更新到主倉庫記錄的特定提交 | 與主倉庫保持一致 |
| `git submodule update --remote` | - | 更新子模組到遠端 HEAD（追蹤遠端分支） | 需要取得子模組上游最新變更 |
| `git submodule update --init` | - | 初始化並更新子模組 | 首次設定時使用 |
| `git submodule update --recursive` | - | 更新巢狀子模組 | 複雜的子模組結構 |

**更新情境：**
```bash
# 情境1：將所有子模組更新到主倉庫記錄的提交
git submodule update --init --recursive

# 情境2：更新特定子模組到最新
git submodule update --remote libs/library

# 情境3：先拉取主倉庫更新，再初始化子模組
git pull
git submodule update --init --recursive

# 情境4：將所有子模組更新到各自遠端 HEAD
git submodule update --remote --recursive
```

### 狀態與資訊查詢

| 指令 | 用途 | 輸出資訊 |
|------|------|---------|
| `git submodule status` | 顯示子模組狀態 | 提交雜湊、分支、是否有未提交變更 |
| `git submodule summary` | 顯示自上次更新以來的變更摘要 | 提交差異摘要 |
| `git submodule foreach` | 在每個子模組中執行指令 | 執行結果回傳 |
| `git ls-files --stage` | 顯示子模組索引條目 | 索引內的子模組資訊 |

**狀態範例：**
```bash
# 檢查子模組狀態
git submodule status
# 輸出範例：
#  abc1234 libs/library (heads/main)
# + def5678 docs/api (1 ahead)

# 顯示子模組摘要
git submodule summary
# 輸出範例：
# * libs/library abc1234...def5678 (2):
#   > Add new feature
#   > Fix bug

# 在每個子模組中執行指令
git submodule foreach 'git status'

# 檢查子模組是否為乾淨狀態（無未提交變更）
git submodule foreach 'git diff --exit-code'
```

---

## 進階子模組管理

### 在子模組內開發

| 指令 | 用途 | 何時使用 |
|------|------|---------|
| `cd <submodule-path>` | 進入子模組目錄 | 對子模組代碼進行修改 |
| `git checkout <branch>` | 切換子模組分支 | 在子模組內切換版本 |
| `git pull` | 更新子模組倉庫 | 取得子模組最新變更 |
| `git commit` | 提交子模組修改 | 更新主倉庫中的子模組指標 |

**子模組開發工作流程：**
```bash
# 1. 進入子模組目錄
cd libs/library

# 2. 在子模組內開發
git checkout -b feature/new-feature
# ... 修改 ...
git add .
git commit -m "feat: add new feature"

# 3. 回到主倉庫更新子模組指標
cd ..
git add libs/library
git commit -m "update: library to latest version"

# 4. 推送子模組與主倉庫變更
cd libs/library
git push origin feature/new-feature
cd ..
git push origin main
```

### 同步子模組設定

| 指令 | 選項 | 用途 | 何時使用 |
|------|------|------|---------|
| `git submodule sync` | - | 更新子模組遠端 URL 設定 | 子模組 URL 變更後同步 |
| `git submodule sync --recursive` | - | 同步巢狀子模組的 URL | 複雜結構下使用 |
| `git submodule deinit` | - | 移除子模組設定（可進行清理） | 清理不再使用的子模組 |

**同步示例：**
```bash
# 在遠端變更後同步子模組 URL
git submodule sync

# 同步並更新所有子模組
git submodule sync --recursive
git submodule update --init --recursive

# 完整移除子模組
git submodule deinit libs/library
git rm libs/library
rm -rf .git/modules/libs/library
```

### 子模組分支管理策略

| 策略 | 描述 | 適用情境 |
|------|------|---------|
| 固定提交 | 子模組指向特定提交雜湊 | 穩定發佈情境 |
| 跟蹤分支 | 子模組追蹤某個分支（如 develop/main） | 開發環境，需要持續更新 |
| 基於標籤 | 子模組指向指定 tag | 版本管理 |

**示例：**
```bash
# 策略1：預設為固定提交
git submodule add https://github.com/user/library.git
# 子模組會指向特定提交雜湊

# 策略2：追蹤分支
git submodule add -b develop https://github.com/user/library.git
git config -f .gitmodules submodule.libs/library.branch develop
git add .gitmodules
git commit -m "track develop branch for library"

# 策略3：更新到特定 tag
cd libs/library
git checkout v2.0.0
cd ..
git add libs/library
git commit -m "update: library to v2.0.0"
```

### 巢狀子模組

| 指令 | 用途 | 何時使用 |
|------|------|---------|
| `git submodule update --init --recursive` | 初始化巢狀子模組 | 複雜依賴樹 |
| `git submodule foreach --recursive` | 針對巢狀子模組遞迴執行指令 | 批次操作巢狀子模組 |
| `git submodule status --recursive` | 顯示巢狀子模組狀態 | 深度檢查 |

**巢狀子模組工作流程：**
```bash
# 克隆並初始化巢狀子模組
git clone --recurse-submodules https://github.com/user/project.git

# 更新巢狀子模組
git submodule update --init --recursive

# 查看所有巢狀子模組狀態
git submodule status --recursive

# 在所有巢狀子模組中執行指令
git submodule foreach --recursive 'git log --oneline -1'
```

---

## 工作流程策略

### 開發工作流程

#### 情境1：外部庫管理

```bash
# 1. 將第三方庫加入為子模組
git submodule add https://github.com/third-party/library.git vendor/library

# 2. 鎖定到特定版本
cd vendor/library
git checkout v1.2.3
cd ..
git add vendor/library
git commit -m "vendor: lock library to v1.2.3"

# 3. 需要升級時更新版本
cd vendor/library
git fetch
git checkout v1.3.0
cd ..
git add vendor/library
git commit -m "vendor: update library to v1.3.0"
```

#### 情境2：共享元件開發

```bash
# 1. 將共享元件作為獨立倉庫開發
git clone https://github.com/company/shared-components.git
cd shared-components
# ... 開發元件 ...
git push

# 2. 在多個專案中新增為子模組
cd project-a
git submodule add https://github.com/company/shared-components.git components/shared
git commit -m "feat: add shared components submodule"

cd ../project-b
git submodule add https://github.com/company/shared-components.git components/shared
git commit -m "feat: add shared components submodule"

# 3. 當共享元件有更新時，於各專案中同步更新
cd project-a
cd components/shared
git pull
cd ../..
git add components/shared
git commit -m "update: shared components to latest"
```

#### 情境3：文件整合

```bash
# 1. 新增文件子模組
git submodule add https://github.com/project/docs.git docs

# 2. 設定追蹤 main 分支
git config -f .gitmodules submodule.docs.branch main
git add .gitmodules
git commit -m "docs: track main branch for documentation"

# 3. 同步文件
git submodule update --remote docs
git add docs
git commit -m "docs: sync with latest documentation"
```

### 發佈管理

#### 鎖定版本策略

```bash
# 1. 建立發佈分支
git checkout -b release/v2.0.0

# 2. 將所有子模組鎖定到發佈版本
git submodule foreach 'git checkout $(git describe --tags --abbrev=0)'

# 3. 提交鎖定版本
git add .
git commit -m "release: pin all submodules for v2.0.0"

# 4. 建立標籤並推送
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0
```

#### 自動更新腳本示例

```bash
#!/bin/bash
# scripts/update-submodules.sh

echo "Updating all submodules..."

# 更新每個子模組到最新
git submodule foreach '
    echo "Updating $name..."
    git fetch origin
    git checkout origin/$(git config --get submodule.$name.branch || echo main)
'

# 提交更新
git add .
git commit -m "chore: update all submodules to latest"

echo "Submodule updates complete!"
```

---

## 與子模組協作

### 團隊入職

#### 新成員設定腳本

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "Setting up development environment..."

# 克隆主倉庫
git clone https://github.com/company/project.git
cd project

# 初始化並更新所有子模組
git submodule update --init --recursive

# 如有需要，安裝子模組內相依
git submodule foreach '
    if [ -f "package.json" ]; then
        echo "Installing dependencies in $name..."
        npm install
    elif [ -f "requirements.txt" ]; then
        echo "Installing Python dependencies in $name..."
        pip install -r requirements.txt
    fi
'

echo "Development environment ready!"
```

#### 子模組貢獻流程

```bash
# 1. 在子模組中進行變更
cd libs/shared-component
git checkout -b feature/new-feature
# ... 變更 ...
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. 為子模組變更建立 PR（透過 GitHub/GitLab UI）

# 3. 子模組 PR 合併後，在主倉庫更新子模組指標
cd ../..
cd libs/shared-component
git checkout main
git pull
cd ..
git add libs/shared-component
git commit -m "update: shared-component to latest"
git push origin main
```

### CI/CD 整合

#### GitHub Actions 範例

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
      with:
        submodules: recursive
        
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        git submodule foreach 'npm install || true'
        
    - name: Run tests
      run: |
        npm test
        git submodule foreach 'npm test || true'
```

#### GitLab CI 範例

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build

variables:
  GIT_SUBMODULE_STRATEGY: recursive

test:
  stage: test
  script:
    - npm install
    - git submodule foreach 'npm install || true'
    - npm test
    - git submodule foreach 'npm test || true'

build:
  stage: build
  script:
    - npm run build
    - git submodule foreach 'npm run build || true'
  artifacts:
    paths:
      - dist/
```

---

## 疑難排解與最佳實踐

### 常見問題與解決方案

#### 問題1：子模組處於 Detached HEAD

```bash
# 問題：子模組為 detached HEAD
cd libs/library
git status
# 輸出：HEAD detached at abc1234

# 解法：檢出正確分支
git checkout main
# 或
# git checkout -b feature-branch origin/feature-branch

# 同步 .gitmodules 以追蹤分支
cd ..
git config -f .gitmodules submodule.libs/library.branch main
git add .gitmodules
git commit -m "fix: track main branch for library submodule"
```

#### 問題2：子模組未初始化

```bash
# 問題：子模組目錄存在但未初始化
git submodule status
# 輸出：-abc1234 libs/library

# 解法：初始化子模組
git submodule init libs/library
git submodule update libs/library

# 或初始化所有子模組
git submodule update --init --recursive
```

#### 問題3：子模組 URL 更動

```bash
# 問題：子模組遠端 URL 變更
cd libs/library
git remote -v
# 仍顯示舊的 URL

# 解法：更新 .gitmodules 中的 URL
git config -f .gitmodules submodule.libs.library.url https://new-url.com/library.git
git submodule sync libs/library
git add .gitmodules
git commit -m "fix: update library submodule URL"
```

#### 問題4：子模組指標合併衝突

```bash
# 問題：子模組指標衝突
git merge feature-branch
# 輸出：CONFLICT (content): Merge conflict in libs/library

# 解法：選擇正確的子模組版本
git checkout --ours libs/library  # 保留本方版本
# 或
git checkout --theirs libs/library  # 採用 incoming 版本

# 標記已解決並提交
git add libs/library
git commit -m "resolve: submodule merge conflict"
```

### 最佳實踐

#### 倉庫組織建議

```bash
# 推薦目錄結構
project/
├── .gitmodules
├── src/
├── vendor/           # 第三方函式庫
│   ├── library1/
│   └── library2/
├── components/       # 共享元件
│   └── ui-components/
├── docs/            # 文件
│   └── api-docs/
└── tools/           # 建置工具
    └── build-scripts/
```

#### .gitmodules 範例配置

```bash
# .gitmodules 最佳做法
[submodule "vendor/library"]
    path = vendor/library
    url = https://github.com/third-party/library.git
    branch = main
    shallow = true

[submodule "components/shared"]
    path = components/shared
    url = https://github.com/company/shared-components.git
    branch = develop
```

#### 子模組相關提交範例

```bash
# 與子模組相關的提交訊息
git commit -m "vendor: add lodash library as submodule"
git commit -m "update: shared-components to v2.1.0"
git commit -m "fix: pin library to stable version"
git commit -m "docs: sync with latest documentation"
git commit -m "chore: update all submodules to latest"
```

#### 性能優化建議

```bash
# 對大型子模組使用淺層克隆
git submodule add --depth 1 https://github.com/large/library.git

# 大型子模組稀疏檢出
cd vendor/library
git config core.sparsecheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -mu HEAD

# 僅更新變更的子模組
git submodule update $(git diff --name-only HEAD~1 HEAD | grep -E '^[^/]+/' | sort -u)
```

### 安全性考量

#### 子模組驗證範例

```bash
#!/bin/bash
# scripts/verify-submodules.sh

echo "Verifying submodule integrity..."

# 檢查是否有未提交變更
git submodule foreach '
    if [ -n "$(git status --porcelain)" ]; then
        echo "Warning: $name has uncommitted changes"
    fi
'

# 驗證 URL 是否為 HTTPS
git config --get-regexp '^submodule\..*\.url$' | while read line; do
    url=$(echo $line | cut -d' ' -f2)
    if [[ ! $url =~ ^https:// ]]; then
        echo "Warning: Insecure URL: $url"
    fi
done

echo "Verification complete."
```

#### 存取控制範例

```bash
# 在 CI 中限制子模組更新
#!/bin/bash
# ci-scripts/submodule-check.sh

# 只允許特定的倉庫
ALLOWED_REPOS=("github.com/company/*" "github.com/trusted-vendor/*")

git submodule foreach '
    remote_url=$(git config --get remote.origin.url)
    allowed=false
    for repo in "${ALLOWED_REPOS[@]}"; do
        if [[ $remote_url =~ $repo ]]; then
            allowed=true
            break
        fi
    done
    
    if [ "$allowed" = false ]; then
        echo "Error: Submodule $name from unauthorized repository: $remote_url"
        exit 1
    fi
'
```

---

## 替代方案

### Git Subtree

| 特性 | Submodule | Subtree |
|------|----------|---------|
| 倉庫大小 | 小（指標） | 完整歷史包含在主倉庫中 |
| 工作流程複雜度 | 較高 | 較低 |
| 是否可獨立更新 | 可 | 否 |
| 歷史是否分離 | 是 | 否 |
| 學習曲線 | 較陡 | 較平緩 |

**何時使用 Subtree：**
```bash
# 新增 subtree
git subtree add --prefix=vendor/library https://github.com/user/library.git main --squash

# 更新 subtree
git subtree pull --prefix=vendor/library https://github.com/user/library.git main --squash

# 推送變更回上游
git subtree push --prefix=vendor/library https://github.com/user/library.git main
```

### 套件管理工具

| 語言 | 套件管理 | 適用場景 |
|------|---------|---------|
| JavaScript | npm, yarn | Node.js 的依賴管理 |
| Python | pip, conda | Python 套件 |
| Ruby | bundler | Ruby 套件 |
| Java | Maven, Gradle | Java 依賴 |
| Go | go modules | Go 套件 |

**示例：npm vs 子模組**
```bash
# npm 方式
npm install lodash@4.17.21

# 子模組方式
git submodule add https://github.com/lodash/lodash.git vendor/lodash
cd vendor/lodash
git checkout 4.17.21
```

### Monorepo 工具

| 工具 | 特性 | 適合情境 |
|------|------|---------|
| Lerna | 多套件管理 | JavaScript monorepo |
| Nx | 高階快取、影響範圍分析 | 大型組織 |
| Bazel | 建置系統、依賴分析 | 複雜建置情境 |
| Turborepo | 快速建置、快取 | 對效能敏感的專案 |

---

## 實際範例

### 範例1：WordPress 外掛開發

```bash
# 專案結構
wordpress-site/
├── .gitmodules
├── wp-content/
│   ├── themes/
│   │   └── custom-theme/
│   └── plugins/
│       ├── custom-plugin/
│       └── vendor/
│           ├── contact-form-7/
│           └── seo-plugin/

# 新增子模組
git submodule add https://github.com/contact-form-7/contact-form-7.git wp-content/plugins/vendor/contact-form-7
git submodule add https://github.com/yoast/wordpress-seo.git wp-content/plugins/vendor/seo-plugin

# 更新工作流程
git submodule foreach -- wp-content/plugins/vendor/ '
    git fetch
    git checkout $(git describe --tags --abbrev=0)
'
git add .
git commit -m "update: plugins to latest stable versions"
```

### 範例2：微服務文件整合

```bash
# 專案結構
microservices-docs/
├── .gitmodules
├── mkdocs.yml
├── docs/
│   ├── api/
│   │   ├── user-service/
│   │   ├── order-service/
│   │   └── payment-service/
│   └── guides/

# 新增子模組
git submodule add https://github.com/company/user-service.git docs/api/user-service
git submodule add https://github.com/company/order-service.git docs/api/order-service
git submodule add https://github.com/company/payment-service.git docs/api/payment-service

# 自動更新腳本
#!/bin/bash
# scripts/update-api-docs.sh

for service in user-service order-service payment-service; do
    echo "Updating $service documentation..."
    cd docs/api/$service
    git pull origin main
    cd ../../..
done

# 建置文件
mkdocs build
git add docs/
git commit -m "docs: update API documentation"
```

### 範例3：韌體專案

```bash
# 專案結構
firmware-project/
├── .gitmodules
├── src/
├── lib/
│   ├── hal/          # 硬體抽象層
│   ├── drivers/      # 裝置驅動
│   └── protocols/    # 通訊協定
└── tools/
    ├── build-scripts/
    └── flash-tools/

# 使用特定分支新增子模組
git submodule add -b stable https://github.com/chip-vendor/hal.git lib/hal
git submodule add -b main https://github.com/company/drivers.git lib/drivers
git submodule add -b v1.0 https://github.com/standards/protocols.git lib/protocols

# 版本構建腳本
#!/bin/bash
# scripts/build-version.sh

VERSION=$1
echo "Building firmware version $VERSION..."

# 更新子模組到指定版本
git checkout $VERSION
git submodule update --init --recursive

# 構建
make clean
make all

# 打包
tar -czf firmware-$VERSION.tar.gz bin/
```

### 範例4：教育課程平台

```bash
# 專案結構
course-platform/
├── .gitmodules
├── courses/
│   ├── python-basics/
│   ├── web-development/
│   └── data-science/
├── shared/
│   ├── exercises/
│   ├── solutions/
│   └── templates/
└── tools/
    ├── grader/
    └── deployment/

# 新增課程子模組
git submodule add https://github.com/edu/python-basics.git courses/python-basics
git submodule add https://github.com/edu/web-development.git courses/web-development
git submodule add https://github.com/edu/data-science.git courses/data-science

# 學期更新腳本
#!/bin/bash
# scripts/update-semester.sh

SEMESTER=$1
echo "Updating courses for $SEMESTER..."

# 更新所有課程內容
git submodule foreach '
    echo "Updating $name..."
    git fetch origin
    git checkout origin/$SEMESTER || origin/main
'

# 更新共享資源
cd shared/exercises
git pull origin main
cd ../solutions
git pull origin main
cd ../..

# 提交更新
git add .
git commit -m "update: course content for $SEMESTER"
git tag -a $SEMESTER -m "Course content for $SEMESTER"
```

---

## 效能與優化

### 大型倉庫處理

```bash
# 部分克隆並初始化子模組
git clone --filter=blob:none --recurse-submodules https://github.com/large/project.git

# 稀疏檢出搭配子模組
git config core.sparsecheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -mu HEAD

# 僅更新指定子模組
git submodule update vendor/library1 vendor/library2
```

### 快取策略

```bash
# 子模組效能相關設定
git config --global submodule.fetchJobs 4  # 並行抓取
git config --global status.submoduleSummary true  # 顯示摘要

# 智能更新腳本
#!/bin/bash
# scripts/smart-update.sh

# 只更新發生變更的子模組
CHANGED=$(git diff --name-only HEAD~1 HEAD | grep -E '^[^/]+' | sort -u)

if [ -n "$CHANGED" ]; then
    echo "Updating changed submodules: $CHANGED"
    git submodule update --init $CHANGED
else
    echo "No submodule changes detected"
fi
```

---

## 遷移指南

### 從 Subtree 遷移到 Submodule

```bash
#!/bin/bash
# scripts/migrate-to-submodule.sh

SUBMODULE_NAME="library"
SUBMODULE_URL="https://github.com/user/library.git"

# 1. 移除 subtree
git rm -r vendor/$SUBMODULE_NAME
git commit -m "remove: $SUBMODULE_NAME subtree"

# 2. 新增為子模組
git submodule add $SUBMODULE_URL vendor/$SUBMODULE_NAME
git commit -m "add: $SUBMODULE_NAME as submodule"

# 3. 清理
rm -rf .git/modules/vendor/$SUBMODULE_NAME
git submodule update --init --recursive
```

### 從 vendor 目錄遷移到子模組

```bash
#!/bin/bash
# scripts/vendor-to-submodule.sh

VENDOR_DIR="vendor/library"
SUBMODULE_URL="https://github.com/user/library.git"

# 1. 備份 vendor 目錄
cp -r $VENDOR_DIR ${VENDOR_DIR}.backup

# 2. 從 git 中移除該目錄
git rm -r $VENDOR_DIR

# 3. 新增為子模組
git submodule add $SUBMODULE_URL $VENDOR_DIR

# 4. 如需，手動比較並合併變更

# 5. 清理備份
rm -rf ${VENDOR_DIR}.backup
```

---

## 參考資料與延伸閱讀

### 官方文件
- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Pro Git - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

### 工具與實用套件
- [git-submodule-tools](https://github.com/ingydotnet/git-submodule-tools)
- [mr - Multiple Repository management](https://myrepos.branchable.com/)
- [repo - Android 的多倉庫管理工具](https://source.android.com/setup/develop/repo)

### 最佳實踐指南
- [Atlassian Git Submodules 教學](https://www.atlassian.com/git/tutorials/git-submodules)
- [GitHub Submodules 指南](https://docs.github.com/en/repositories/working-with-submodules)

### 進階主題
- [Git Submodule 設計文檔](https://github.com/git/git/blob/master/Documentation/technical/submodule-design.txt)
- [大檔案儲存 Git LFS](https://git-lfs.github.com/)

---

*最後更新：2025 年 12 月*