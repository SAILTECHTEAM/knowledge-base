# Git 子模块完整指南

## 目录
1. [什么是 Git 子模块](#什么是-git-子模块)
2. [子模块基础操作](#子模块基础操作)
3. [高级子模块管理](#高级子模块管理)
4. [工作流策略](#工作流策略)
5. [与子模块协作](#与子模块协作)
6. [故障排查与最佳实践](#故障排查与最佳实践)
7. [替代方案](#替代方案)
8. [真实案例](#真实案例)

---

## 什么是 Git 子模块

### Git 子模块是什么？

Git 子模块允许你将一个 Git 仓库作为另一个 Git 仓库的子目录来管理。这使得你可以在主项目中包含并跟踪外部仓库，同时独立维护它们的版本历史。

### 为什么使用子模块？

| 用例 | 描述 | 示例 |
|------|------|------|
| 库依赖 | 包含第三方库的特定版本 | 将 UI 框架或工具库作为子模块托管 |
| 组件复用 | 在多个项目间共享公共组件 | 共享的认证模块 |
| 文档整合 | 包含外部文档仓库 | 来自其它仓库的 API 文档 |
| 微服务组织 | 在单一仓库中组织相关服务 | 多个服务组成的项目 |
| 插件系统 | 将插件作为独立仓库管理 | WordPress 插件、VS Code 扩展 |

### 子模块与其它方案对比

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 子模块 | 保留版本控制、独立历史、可选择更新 | 工作流相对复杂、需手动更新 | 外部依赖且需要固定版本 |
| Git subtree | 历史合并在主仓库中、单仓库管理更简单 | 仓库体积增大、无法独立更新 | 内部组件、紧耦合集成 |
| 包管理器 | 自动更新、依赖解析 | 不保留源码版本控制（通常为构建产物） | 语言生态的依赖（npm/pip 等） |
| Monorepo 工具 | 高级特性、自动化 | 配置复杂，需要学习成本 | 大型组织、多项目管理 |

---

## 子模块基础操作

### 添加子模块

| 命令 | 选项 | 目的 | 何时使用 |
|------|------|------|---------|
| `git submodule add <url>` | - | 在默认路径添加子模块 | 基本添加场景 |
| `git submodule add <url> <path>` | - | 在指定路径添加子模块 | 自定义目录结构 |
| `git submodule add -b <branch> <url>` | - | 追踪特定分支 | 需要跟踪开发分支 |
| `git submodule add --depth 1 <url>` | - | 浅克隆子模块 | 子模块很大、希望加速初始化 |

**基本用法：**
```bash
# 在默认路径（仓库名）添加子模块
git submodule add https://github.com/user/library.git

# 在指定目录添加子模块
git submodule add https://github.com/user/library.git libs/library

# 追踪特定分支
git submodule add -b main https://github.com/user/library.git

# 使用浅克隆（更快、历史更少）
git submodule add --depth 1 https://github.com/user/library.git
```

### 克隆包含子模块的仓库

| 命令 | 选项 | 目的 | 何时使用 |
|------|------|------|---------|
| `git clone --recurse-submodules <url>` | - | 同时克隆主仓库与所有子模块 | 项目初次拉取 |
| `git clone <url> && git submodule update --init --recursive` | - | 手动两步克隆 | 需要更灵活的初始化流程 |
| `git clone --depth 1 --recurse-submodules <url>` | - | 浅克隆并初始化子模块 | 大型项目的快速设置 |

**克隆工作流：**
```bash
# 方法1：一步完成克隆并初始化子模块
git clone --recurse-submodules https://github.com/user/project.git
cd project

# 方法2：两步克隆（更可控）
git clone https://github.com/user/project.git
cd project
git submodule update --init --recursive

# 方法3：浅克隆并初始化子模块
git clone --depth 1 --recurse-submodules https://github.com/user/project.git
```

### 更新子模块

| 命令 | 选项 | 目的 | 何时使用 |
|------|------|------|---------|
| `git submodule update` | - | 将子模块更新到主仓库记录的特定提交 | 与主仓库保持一致 |
| `git submodule update --remote` | - | 更新子模块到远端 HEAD（跟踪远端分支） | 需要拿到子模块上游最新代码 |
| `git submodule update --init` | - | 初始化并更新子模块 | 首次设置时使用 |
| `git submodule update --recursive` | - | 更新嵌套子模块 | 复杂的子模块嵌套结构 |

**更新场景：**
```bash
# 场景1：将所有子模块更新到主仓库记录的提交
git submodule update --init --recursive

# 场景2：更新某一子模块到远端最新
git submodule update --remote libs/library

# 场景3：先拉取主仓库更新，再初始化子模块
git pull
git submodule update --init --recursive

# 场景4：将所有子模块更新到各自的远端 HEAD
git submodule update --remote --recursive
```

### 查看状态与信息

| 命令 | 目的 | 输出信息 |
|------|------|---------|
| `git submodule status` | 显示子模块状态 | 提交哈希、分支、是否有未提交变更 |
| `git submodule summary` | 显示自上次更新以来的变更摘要 | 提交差异摘要 |
| `git submodule foreach` | 在每个子模块中运行命令 | 执行命令并返回结果 |
| `git ls-files --stage` | 显示子模块索引条目 | 索引中的子模块信息 |

**状态示例：**
```bash
# 检查子模块状态
git submodule status
# 输出示例：
#  abc1234 libs/library (heads/main)
# + def5678 docs/api (1 ahead)

# 查看子模块摘要
git submodule summary
# 输出示例：
# * libs/library abc1234...def5678 (2):
#   > Add new feature
#   > Fix bug

# 在每个子模块中运行命令
git submodule foreach 'git status'

# 检查子模块是否干净（无未提交变更）
git submodule foreach 'git diff --exit-code'
```

---

## 高级子模块管理

### 在子模块内开发

| 命令 | 目的 | 何时使用 |
|------|------|---------|
| `cd <submodule-path>` | 进入子模块目录 | 对子模块代码进行修改 |
| `git checkout <branch>` | 切换子模块分支 | 在子模块内部切换版本 |
| `git pull` | 更新子模块仓库 | 获取子模块最新变更 |
| `git commit` | 提交子模块修改 | 更新主仓库中的子模块指针 |

**子模块开发工作流：**
```bash
# 1. 进入子模块目录
cd libs/library

# 2. 在子模块中开发
git checkout -b feature/new-feature
# ... 修改代码 ...
git add .
git commit -m "feat: add new feature"

# 3. 在主仓库中更新子模块指针
cd ..
git add libs/library
git commit -m "update: library to latest version"

# 4. 推送子模块及主仓库的变更
cd libs/library
git push origin feature/new-feature
cd ..
git push origin main
```

### 同步子模块配置

| 命令 | 选项 | 目的 | 何时使用 |
|------|------|------|---------|
| `git submodule sync` | - | 更新子模块的远端 URL 配置 | 子模块 URL 变更后同步 |
| `git submodule sync --recursive` | - | 同步嵌套子模块的 URL | 复杂结构下使用 |
| `git submodule deinit` | - | 移除子模块配置（保留目录或清理） | 清理不再使用的子模块 |

**同步示例：**
```bash
# 在远端变更后同步子模块 URL
git submodule sync

# 同步并更新所有子模块
git submodule sync --recursive
git submodule update --init --recursive

# 完全移除子模块
git submodule deinit libs/library
git rm libs/library
rm -rf .git/modules/libs/library
```

### 子模块的分支管理策略

| 策略 | 描述 | 适用场景 |
|------|------|---------|
| 固定提交 | 子模块指向具体提交哈希 | 稳定发布场景 |
| 跟踪分支 | 子模块跟踪某个分支（如 develop/main） | 开发环境，需要持续更新 |
| 基于 tag | 子模块指向某个 tag | 版本发布管理 |

**示例：**
```bash
# 策略1：默认固定提交
git submodule add https://github.com/user/library.git
# 子模块会指向特定提交哈希

# 策略2：跟踪分支
git submodule add -b develop https://github.com/user/library.git
git config -f .gitmodules submodule.libs/library.branch develop
git add .gitmodules
git commit -m "track develop branch for library"

# 策略3：切换到特定 tag
cd libs/library
git checkout v2.0.0
cd ..
git add libs/library
git commit -m "update: library to v2.0.0"
```

### 嵌套子模块

| 命令 | 目的 | 何时使用 |
|------|------|---------|
| `git submodule update --init --recursive` | 初始化嵌套子模块 | 复杂依赖树 |
| `git submodule foreach --recursive` | 递归执行命令 | 批量操作嵌套子模块 |
| `git submodule status --recursive` | 显示嵌套子模块状态 | 深度检查 |

**嵌套子模块工作流：**
```bash
# 克隆并初始化嵌套子模块
git clone --recurse-submodules https://github.com/user/project.git

# 更新嵌套子模块
git submodule update --init --recursive

# 查看所有嵌套子模块状态
git submodule status --recursive

# 在所有嵌套子模块中执行命令
git submodule foreach --recursive 'git log --oneline -1'
```

---

## 工作流策略

### 开发工作流

#### 场景1：外部库管理

```bash
# 1. 将第三方库作为子模块添加
git submodule add https://github.com/third-party/library.git vendor/library

# 2. 锁定到特定版本
cd vendor/library
git checkout v1.2.3
cd ..
git add vendor/library
git commit -m "vendor: lock library to v1.2.3"

# 3. 需要升级时更新版本
cd vendor/library
git fetch
git checkout v1.3.0
cd ..
git add vendor/library
git commit -m "vendor: update library to v1.3.0"
```

#### 场景2：共享组件开发

```bash
# 1. 将共享组件作为独立仓库开发
git clone https://github.com/company/shared-components.git
cd shared-components
# ... 开发组件 ...
git push

# 2. 在多个项目中以子模块形式引用
cd project-a
git submodule add https://github.com/company/shared-components.git components/shared
git commit -m "feat: add shared components submodule"

cd ../project-b
git submodule add https://github.com/company/shared-components.git components/shared
git commit -m "feat: add shared components submodule"

# 3. 当共享组件更新后，在各项目中同步更新
cd project-a
cd components/shared
git pull
cd ../..
git add components/shared
git commit -m "update: shared components to latest"
```

#### 场景3：文档整合

```bash
# 1. 添加文档仓库作为子模块
git submodule add https://github.com/project/docs.git docs

# 2. 配置追踪 main 分支
git config -f .gitmodules submodule.docs.branch main
git add .gitmodules
git commit -m "docs: track main branch for documentation"

# 3. 自动或手动同步文档
git submodule update --remote docs
git add docs
git commit -m "docs: sync with latest documentation"
```

### 发布管理

#### 版本固定策略

```bash
# 1. 创建发布分支
git checkout -b release/v2.0.0

# 2. 将所有子模块锁定到发布版本
git submodule foreach 'git checkout $(git describe --tags --abbrev=0)'

# 3. 提交锁定的版本
git add .
git commit -m "release: pin all submodules for v2.0.0"

# 4. 打标签并推送
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0
```

#### 自动更新脚本示例

```bash
#!/bin/bash
# scripts/update-submodules.sh

echo "Updating all submodules..."

# 更新每个子模块到最新
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

## 与子模块协作

### 团队入职

#### 新开发者设置脚本

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "Setting up development environment..."

# 克隆主仓库
git clone https://github.com/company/project.git
cd project

# 初始化并更新所有子模块
git submodule update --init --recursive

# 如有需要，安装子模块内依赖
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

#### 子模块贡献流程

```bash
# 1. 在子模块中进行变更
cd libs/shared-component
git checkout -b feature/new-feature
# ... 修改 ...
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. 为子模块的变更创建 PR（通过 GitHub/GitLab 界面）

# 3. 子模块 PR 合并后，在主仓库中更新子模块指针
cd ../..
cd libs/shared-component
git checkout main
git pull
cd ..
git add libs/shared-component
git commit -m "update: shared-component to latest"
git push origin main
```

### CI/CD 集成

#### GitHub Actions 示例

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

#### GitLab CI 示例

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

## 故障排查与最佳实践

### 常见问题与解决方案

#### 问题1：子模块处于 Detached HEAD 状态

```bash
# 问题：子模块处于 detached HEAD
cd libs/library
git status
# 输出：HEAD detached at abc1234

# 解决：检出正确分支
git checkout main
# 或者
git checkout -b feature-branch origin/feature-branch

# 更新主仓库以追踪分支
cd ..
git config -f .gitmodules submodule.libs/library.branch main
git add .gitmodules
git commit -m "fix: track main branch for library submodule"
```

#### 问题2：子模块未初始化

```bash
# 问题：子模块目录存在但未初始化
git submodule status
# 输出：-abc1234 libs/library

# 解决：初始化子模块
git submodule init libs/library
git submodule update libs/library

# 或者初始化所有子模块
git submodule update --init --recursive
```

#### 问题3：子模块 URL 发生变化

```bash
# 问题：子模块远端 URL 发生变化
cd libs/library
git remote -v
# 仍显示旧的 URL

# 解决：更新 .gitmodules 中的 URL
git config -f .gitmodules submodule.libs.library.url https://new-url.com/library.git
git submodule sync libs/library
git add .gitmodules
git commit -m "fix: update library submodule URL"
```

#### 问题4：子模块指针合并冲突

```bash
# 问题：子模块指针冲突
git merge feature-branch
# 输出：CONFLICT (content): Merge conflict in libs/library

# 解决：选择正确的子模块版本
git checkout --ours libs/library  # 保留本地版本
# 或
git checkout --theirs libs/library  # 采用 incoming 版本

# 标记解决并提交
git add libs/library
git commit -m "resolve: submodule merge conflict"
```

### 最佳实践

#### 仓库组织结构

```bash
# 推荐目录结构
project/
├── .gitmodules
├── src/
├── vendor/           # 第三方库
│   ├── library1/
│   └── library2/
├── components/       # 共享组件
│   └── ui-components/
├── docs/            # 文档
│   └── api-docs/
└── tools/           # 构建工具
    └── build-scripts/
```

#### .gitmodules 配置示例

```bash
# .gitmodules 最佳实践示例
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

#### 子模块相关提交信息规范

```bash
# 与子模块相关的提交示例
git commit -m "vendor: add lodash library as submodule"
git commit -m "update: shared-components to v2.1.0"
git commit -m "fix: pin library to stable version"
git commit -m "docs: sync with latest documentation"
git commit -m "chore: update all submodules to latest"
```

#### 性能优化示例

```bash
# 对于大型子模块使用浅克隆
git submodule add --depth 1 https://github.com/large/library.git

# 对大型子模块使用稀疏检出（sparse checkout）
cd vendor/library
git config core.sparsecheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -mu HEAD

# 仅更新发生变更的子模块
git submodule update $(git diff --name-only HEAD~1 HEAD | grep -E '^[^/]+/' | sort -u)
```

### 安全注意事项

#### 子模块校验脚本示例

```bash
#!/bin/bash
# scripts/verify-submodules.sh

echo "Verifying submodule integrity..."

# 检查是否有未提交的变更
git submodule foreach '
    if [ -n "$(git status --porcelain)" ]; then
        echo "Warning: $name has uncommitted changes"
    fi
'

# 验证子模块 URL 是否为 HTTPS
git config --get-regexp '^submodule\..*\.url$' | while read line; do
    url=$(echo $line | cut -d' ' -f2)
    if [[ ! $url =~ ^https:// ]]; then
        echo "Warning: Insecure URL: $url"
    fi
done

echo "Verification complete."
```

#### 访问控制示例

```bash
# 在 CI 中限制子模块更新
#!/bin/bash
# ci-scripts/submodule-check.sh

# 仅允许来自特定仓库的更新
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
| 仓库体积 | 小（指针） | 完整历史包含在主仓库中 |
| 工作流复杂度 | 复杂 | 简单 |
| 是否可独立更新 | 是 | 否 |
| 历史是否分离 | 是 | 否 |
| 学习曲线 | 较陡 | 较平缓 |

**何时使用 Subtree：**
```bash
# 添加 subtree
git subtree add --prefix=vendor/library https://github.com/user/library.git main --squash

# 更新 subtree
git subtree pull --prefix=vendor/library https://github.com/user/library.git main --squash

# 将变更推回上游
git subtree push --prefix=vendor/library https://github.com/user/library.git main
```

### 包管理器对比

| 语言 | 包管理器 | 何时使用 |
|------|---------|---------|
| JavaScript | npm, yarn | Node.js 项目的依赖 |
| Python | pip, conda | Python 库 |
| Ruby | bundler | Ruby gems |
| Java | Maven, Gradle | Java 依赖 |
| Go | go modules | Go 包 |

**示例：npm vs 子模块**
```bash
# npm 方式
npm install lodash@4.17.21

# 子模块方式
git submodule add https://github.com/lodash/lodash.git vendor/lodash
cd vendor/lodash
git checkout 4.17.21
```

### Monorepo 工具

| 工具 | 特性 | 适合场景 |
|------|------|---------|
| Lerna | 多包管理 | JavaScript 单体仓库 |
| Nx | 高级缓存、受影响项目分析 | 大型组织 |
| Bazel | 构建系统、依赖分析 | 复杂构建场景 |
| Turborepo | 快速构建、缓存 | 性能敏感项目 |

---

## 真实案例

### 示例1：WordPress 插件管理

```bash
# 项目结构
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

# 配置子模块
git submodule add https://github.com/contact-form-7/contact-form-7.git wp-content/plugins/vendor/contact-form-7
git submodule add https://github.com/yoast/wordpress-seo.git wp-content/plugins/vendor/seo-plugin

# 更新工作流
git submodule foreach -- wp-content/plugins/vendor/ '
    git fetch
    git checkout $(git describe --tags --abbrev=0)
'
git add .
git commit -m "update: plugins to latest stable versions"
```

### 示例2：微服务文档整合

```bash
# 项目结构
microservices-docs/
├── .gitmodules
├── mkdocs.yml
├── docs/
│   ├── api/
│   │   ├── user-service/
│   │   ├── order-service/
│   │   └── payment-service/
│   └── guides/

# 添加子模块
git submodule add https://github.com/company/user-service.git docs/api/user-service
git submodule add https://github.com/company/order-service.git docs/api/order-service
git submodule add https://github.com/company/payment-service.git docs/api/payment-service

# 自动更新脚本
#!/bin/bash
# scripts/update-api-docs.sh

for service in user-service order-service payment-service; do
    echo "Updating $service documentation..."
    cd docs/api/$service
    git pull origin main
    cd ../../..
done

# 构建文档
mkdocs build
git add docs/
git commit -m "docs: update API documentation"
```

### 示例3：硬件固件项目

```bash
# 项目结构
firmware-project/
├── .gitmodules
├── src/
├── lib/
│   ├── hal/          # 硬件抽象层
│   ├── drivers/      # 设备驱动
│   └── protocols/    # 通信协议
└── tools/
    ├── build-scripts/
    └── flash-tools/

# 使用特定分支添加子模块
git submodule add -b stable https://github.com/chip-vendor/hal.git lib/hal
git submodule add -b main https://github.com/company/drivers.git lib/drivers
git submodule add -b v1.0 https://github.com/standards/protocols.git lib/protocols

# 指定版本构建脚本
#!/bin/bash
# scripts/build-version.sh

VERSION=$1
echo "Building firmware version $VERSION..."

# 更新子模块到指定版本
git checkout $VERSION
git submodule update --init --recursive

# 构建
make clean
make all

# 打包
tar -czf firmware-$VERSION.tar.gz bin/
```

### 示例4：教育课程平台

```bash
# 项目结构
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

# 添加课程子模块
git submodule add https://github.com/edu/python-basics.git courses/python-basics
git submodule add https://github.com/edu/web-development.git courses/web-development
git submodule add https://github.com/edu/data-science.git courses/data-science

# 学期更新脚本
#!/bin/bash
# scripts/update-semester.sh

SEMESTER=$1
echo "Updating courses for $SEMESTER..."

# 更新所有课程内容
git submodule foreach '
    echo "Updating $name..."
    git fetch origin
    git checkout origin/$SEMESTER || origin/main
'

# 更新共享资源
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

## 性能与优化

### 大型仓库处理

```bash
# 使用部分克隆并初始化子模块
git clone --filter=blob:none --recurse-submodules https://github.com/large/project.git

# 稀疏检出并结合子模块
git config core.sparsecheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -mu HEAD

# 仅更新指定子模块
git submodule update vendor/library1 vendor/library2
```

### 缓存策略

```bash
# 子模块性能相关配置
git config --global submodule.fetchJobs 4  # 并行抓取
git config --global status.submoduleSummary true  # 显示摘要

# 智能更新脚本
#!/bin/bash
# scripts/smart-update.sh

# 只更新发生变更的子模块
CHANGED=$(git diff --name-only HEAD~1 HEAD | grep -E '^[^/]+' | sort -u)

if [ -n "$CHANGED" ]; then
    echo "Updating changed submodules: $CHANGED"
    git submodule update --init $CHANGED
else
    echo "No submodule changes detected"
fi
```

---

## 迁移指南

### 从 Subtree 迁移到 Submodule

```bash
#!/bin/bash
# scripts/migrate-to-submodule.sh

SUBMODULE_NAME="library"
SUBMODULE_URL="https://github.com/user/library.git"

# 1. 移除 subtree
git rm -r vendor/$SUBMODULE_NAME
git commit -m "remove: $SUBMODULE_NAME subtree"

# 2. 添加为子模块
git submodule add $SUBMODULE_URL vendor/$SUBMODULE_NAME
git commit -m "add: $SUBMODULE_NAME as submodule"

# 3. 清理
rm -rf .git/modules/vendor/$SUBMODULE_NAME
git submodule update --init --recursive
```

### 从 vendor 目录迁移到子模块

```bash
#!/bin/bash
# scripts/vendor-to-submodule.sh

VENDOR_DIR="vendor/library"
SUBMODULE_URL="https://github.com/user/library.git"

# 1. 备份当前 vendor 目录
cp -r $VENDOR_DIR ${VENDOR_DIR}.backup

# 2. 从 git 中移除该目录
git rm -r $VENDOR_DIR

# 3. 添加为子模块
git submodule add $SUBMODULE_URL $VENDOR_DIR

# 4. 如需，手动比较并合并变更

# 5. 清理备份
rm -rf ${VENDOR_DIR}.backup
```

---

## 参考资料与扩展阅读

### 官方文档
- [Git 子模块文档（英文）](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Pro Git - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

### 工具 & 实用库
- [git-submodule-tools](https://github.com/ingydotnet/git-submodule-tools)
- [mr - Multiple Repository management](https://myrepos.branchable.com/)
- [repo - Android 多仓库管理工具](https://source.android.com/setup/develop/repo)

### 最佳实践指南
- [Atlassian Git Submodules 教程](https://www.atlassian.com/git/tutorials/git-submodules)
- [GitHub Submodules 指南](https://docs.github.com/en/repositories/working-with-submodules)

### 进阶主题
- [Git Submodule 设计文档](https://github.com/git/git/blob/master/Documentation/technical/submodule-design.txt)
- [大文件存储 Git LFS](https://git-lfs.github.com/)

---

*最后更新：2025 年 12 月*