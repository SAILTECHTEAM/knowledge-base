# Git 工程实践完全指南

## 目录
1. [基础命令与工作流](#基础命令与工作流)
2. [分支管理策略](#分支管理策略)
3. [提交与历史管理](#提交与历史管理)
4. [合并与冲突解决](#合并与冲突解决)
5. [远程协作](#远程协作)
6. [高级技巧](#高级技巧)
7. [团队最佳实践](#团队最佳实践)
8. [恢复与调试](#恢复与调试)

---

## 基础命令与工作流

### 初始化与克隆

| 命令 | 选项 | 场景说明 | 最佳实践 |
|------|------|--------|--------|
| `git init` | `--initial-branch=<name>` | 初始化本地仓库 | 在创建新项目时使用，可指定默认分支名称 |
| `git clone <url>` | `--depth 1` | 克隆远程仓库 | 对于大型仓库，使用 --depth 1 进行浅克隆以提高速度 |
| `git clone <url>` | `-b <branch>` | 克隆特定分支 | 只克隆需要的分支，避免下载所有分支 |

**最佳实践：**
```bash
# 浅克隆大型项目
git clone --depth 1 https://github.com/user/repo.git

# 克隆特定分支
git clone -b develop https://github.com/user/repo.git
```

### 基本工作流命令

#### git add - 暂存修改

| 选项 | 用途 | 何时使用 |
|------|------|---------|
| `git add .` | 添加所有修改 | 确认所有修改都应该提交 |
| `git add <file>` | 添加单个文件 | 精选要提交的文件 |
| `git add -p` | 交互式暂存 | 只提交文件的部分修改，分离不同的逻辑变更 |
| `git add -u` | 暂存修改和删除 | 更新已跟踪文件，但不添加新文件 |
| `git add -A` | 暂存所有改动 | 包括新增、修改和删除的文件 |

**实际场景：**
```bash
# 场景1：功能完成，提交所有改动
git add .
git commit -m "feat: add user authentication"

# 场景2：一个文件中有多个无关的修改，需要分离
git add -p
# 交互式选择要暂存的修改块

# 场景3：只提交已跟踪文件的修改
git add -u
```

#### git commit - 创建提交

| 选项 | 用途 | 场景 |
|------|------|------|
| `git commit -m "<msg>"` | 快速提交 | 简单、小型变更 |
| `git commit` | 打开编辑器 | 编写详细提交信息 |
| `git commit --amend` | 修改最后一个提交 | 修正刚才的提交（仅限未推送） |
| `git commit --amend --no-edit` | 修改提交但保留信息 | 添加遗漏的文件到提交 |
| `git commit -v` | 显示diff | 确认要提交的内容 |

**提交信息规范（Conventional Commits）：**
```
<type>(<scope>): <subject>

<body>

<footer>

例子：
feat(auth): implement JWT authentication
- Add JWT token generation
- Add token validation middleware
- Update user model

Closes #123
```

**提交类型：**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更改
- `style`: 代码风格（不影响代码逻辑）
- `refactor`: 重构代码
- `test`: 添加或修改测试
- `chore`: 构建、依赖、工具配置

**自动化提交信息验证：**
可以使用 Git hooks 自动验证提交信息格式，确保团队遵循统一的提交规范。详细配置请参考 [Git Hooks 完全指南](./git-hooks-guide-zh-CN.md) 中的 Commitizen 和 commitlint 部分。

---

## 分支管理策略

### Git Flow 工作流

适合：有定期发布计划的项目

**分支类型：**

| 分支类型 | 命名规范 | 用途 | 生命周期 |
|---------|--------|------|---------|
| `main` | - | 生产环境代码，稳定版本 | 长期 |
| `develop` | - | 开发版本，集成分支 | 长期 |
| `feature/*` | `feature/user-auth` | 新功能开发 | 临时 |
| `release/*` | `release/1.0.0` | 发布前准备 | 临时 |
| `hotfix/*` | `hotfix/critical-bug` | 线上紧急修复 | 临时 |

**工作流步骤：**
```bash
# 1. 创建功能分支
git checkout -b feature/user-dashboard develop

# 2. 开发完成，推送到远程
git push -u origin feature/user-dashboard

# 3. 创建 Pull Request，进行代码审查

# 4. 审查通过，合并到 develop
git checkout develop
git pull origin develop
git merge --no-ff feature/user-dashboard
git push origin develop

# 5. 删除功能分支
git branch -d feature/user-dashboard
git push origin -d feature/user-dashboard

# 6. 准备发布时，从 develop 创建 release 分支
git checkout -b release/1.2.0 develop
# 更新版本号、修复小bug、更新 changelog
git commit -am "bump version to 1.2.0"

# 7. 发布完成，合并到 main 和 develop
git checkout main
git pull origin main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git pull origin develop
git merge --no-ff release/1.2.0
git push origin develop

# 8. 删除 release 分支
git branch -d release/1.2.0
```

### GitHub Flow 工作流

适合：持续部署、简单项目

**特点：** 简化流程，主分支始终可部署

```bash
# 1. 从 main 创建功能分支
git checkout -b feature/new-api main

# 2. 完成开发
git add .
git commit -m "feat: add API endpoint"
git push -u origin feature/new-api

# 3. 创建 Pull Request

# 4. 通过 CI/CD 测试后合并
git checkout main
git pull origin main
git merge --no-ff feature/new-api
git push origin main

# 5. 分支自动删除或手动删除
git branch -d feature/new-api
```

### Trunk-Based Development

适合：高频发布、大型团队

**特点：** 短生命周期分支，频繁合并到主干

```bash
# 1. 从 main 创建短生命周期分支
git checkout -b fb-short-lived main

# 2. 快速迭代（1-2天内完成）
git add .
git commit -m "wip: work in progress"
git push origin fb-short-lived

# 3. 通过 CI 检查后立即合并（使用 feature flag 控制功能可见性）
git checkout main
git pull origin main
git merge --ff fb-short-lived  # 使用 fast-forward merge 保持直线历史
git push origin main

# 4. 删除短生命周期分支
git branch -d fb-short-lived
```

### 分支管理命令

| 命令 | 选项 | 用途 |
|------|------|------|
| `git branch` | `-a` | 列出所有本地和远程分支 |
| `git branch -vv` | - | 显示本地分支与远程分支的跟踪关系 |
| `git branch <name>` | - | 创建新分支 |
| `git branch -d <name>` | - | 删除分支（安全，未合并会拒绝） |
| `git branch -D <name>` | - | 强制删除分支 |
| `git branch -m <old> <new>` | - | 重命名分支 |
| `git checkout <branch>` | - | 切换分支（旧方式） |
| `git switch <branch>` | - | 切换分支（新方式，推荐） |
| `git switch -c <branch>` | - | 创建并切换到新分支 |

---

## 提交与历史管理

### git status - 查看状态

```bash
# 简洁输出
git status -s

# 分支跟踪信息
git status -b

# 详细信息（默认）
git status
```

**理解输出：**
```
 M file.txt          # 修改（未暂存）
M  file.txt          # 修改（已暂存）
A  newfile.txt       # 新文件（已暂存）
D  deleted.txt       # 删除（已暂存）
?? untracked.txt     # 未跟踪文件
```

### git diff - 查看修改

| 命令 | 比较对象 | 用途 | 何时使用 |
|------|---------|------|---------|
| `git diff` | 工作区 vs 暂存区 | 查看未暂存的修改 | 提交前查看具体改动 |
| `git diff --staged` | 暂存区 vs HEAD | 查看已暂存的修改 | 提交前最后验证 |
| `git diff HEAD` | 工作区 vs HEAD | 查看所有未提交修改 | 全局审查变更 |
| `git diff <branch1> <branch2>` | 分支对比 | 比较两个分支的差异 | 合并前预览 |
| `git diff <commit1> <commit2>` | 提交对比 | 比较两个提交 | 审查历史变更 |

**实用选项：**
```bash
# 仅显示修改的文件名
git diff --name-only

# 显示统计信息
git diff --stat

# 显示特定文件的差异
git diff <file>

# 分词级别的diff（更细致）
git diff --word-diff

# 显示行数增删统计
git diff --numstat
```

### git log - 查看历史

| 选项 | 用途 | 场景 |
|------|------|------|
| `git log --oneline` | 单行显示，简洁 | 快速浏览历史 |
| `git log --graph --decorate` | 显示分支图 | 理解分支结构 |
| `git log --all --graph --oneline` | 完整分支图 | 查看所有分支历史 |
| `git log -p` | 显示每个提交的diff | 详细审查修改 |
| `git log --stat` | 显示文件变更统计 | 了解改动范围 |
| `git log --author="name"` | 按作者筛选 | 查看特定人员的提交 |
| `git log --since="2024-01-01"` | 按时间范围筛选 | 查看特定时期的提交 |
| `git log --grep="pattern"` | 按提交信息筛选 | 查找相关功能提交 |
| `git log -S"string"` | 按代码内容搜索 | 追踪特定代码的引入 |

**实用示例：**
```bash
# 查看最近10个提交的详细信息
git log -10 -p

# 查看特定功能的所有相关提交
git log --grep="feat" --oneline

# 查看特定文件的历史
git log -- file.txt

# 查看在 main 分支但不在 develop 分支的提交
git log develop..main

# 查看谁在特定日期之后修改了文件
git log --since="2024-01-01" -- file.txt

# 格式化输出（自定义信息）
git log --pretty=format:"%h - %an, %ar : %s"
```

**常用格式指令：**
```
%h    - 缩短的 commit hash
%an   - 作者名称
%ae   - 作者邮箱
%ad   - 作者日期
%ar   - 作者日期（相对时间）
%s    - 提交信息主题
%b    - 提交信息正文
```

### git show - 查看提交详情

```bash
# 查看特定提交的详细信息和改动
git show <commit>

# 查看特定提交中特定文件的内容
git show <commit>:<file>

# 查看提交统计信息
git show --stat <commit>
```

---

## 合并与冲突解决

### git merge - 合并分支

| 选项 | 结果 | 何时使用 |
|------|------|---------|
| `git merge <branch>` | 创建合并提交 | 保留分支历史信息 |
| `git merge --no-ff <branch>` | 强制创建合并提交 | 功能分支合并，保留分支记录 |
| `git merge --ff-only <branch>` | 仅允许快进合并 | 保持线性历史 |
| `git merge --squash <branch>` | 压缩为单个提交 | 整理功能分支提交历史 |

**合并工作流：**
```bash
# 场景1：合并功能分支，保留分支历史
git checkout develop
git pull origin develop
git merge --no-ff feature/new-api
git push origin develop

# 场景2：合并前检查是否有冲突
git merge --no-commit --no-ff feature/new-api
# 检查状态
git status
# 撤销合并
git merge --abort

# 场景3：整理历史，压缩多个提交
git merge --squash feature/new-api
git commit -m "feat: add new API endpoint"
```

### git rebase - 变基

**适用场景：** 保持线性历史，避免合并提交

| 用途 | 命令 | 何时使用 |
|------|------|---------|
| 基本变基 | `git rebase <branch>` | 更新分支到最新主分支 |
| 交互式变基 | `git rebase -i HEAD~5` | 重新组织、压缩提交 |
| 继续/中止 | `git rebase --continue` | 解决冲突后继续 |
| | `git rebase --abort` | 放弃变基 |

**变基工作流：**
```bash
# 场景1：保持线性历史
git fetch origin
git rebase origin/main
# 如果有冲突，解决后继续
git rebase --continue

# 场景2：压缩多个提交（交互式变基）
git rebase -i HEAD~3
# 在编辑器中选择：
# p pick      - 保留提交
# r reword    - 保留提交但编辑信息
# s squash    - 合并到前一个提交
# f fixup     - 合并到前一个提交，舍弃信息
# e edit      - 停止编辑此提交
# d drop      - 删除提交

# 场景3：修改早期提交的作者信息
git rebase -i <commit>^
# 将要修改的提交改为 e (edit)
git commit --amend --author="Name <email@example.com>"
git rebase --continue
```

**Merge vs Rebase 对比：**

| 特性 | Merge | Rebase |
|------|-------|--------|
| 历史记录 | 保留分支信息 | 线性历史 |
| 安全性 | 高（不修改提交） | 需谨慎（重写历史） |
| 可读性 | 分支清晰 | 简洁直观 |
| 协作 | 安全用于共享分支 | 仅用于本地分支 |
| 冲突处理 | 一次解决 | 逐个提交解决 |

**最佳实践：**
```
- 本地分支：使用 rebase，保持线性历史
- 共享分支：使用 merge，保留历史信息
- 公开发布：从不 rebase 已推送的提交
```

### 冲突解决

#### 识别冲突

```bash
# 冲突标记格式
<<<<<<< HEAD
你的修改内容
=======
他人修改内容
>>>>>>> branch-name
```

#### 解决冲突的步骤

```bash
# 1. 查看冲突文件
git status

# 2. 编辑冲突文件，选择保留哪些内容

# 3. 标记冲突已解决
git add <resolved-file>

# 4. 如果是合并冲突
git commit -m "Resolve merge conflicts"

# 5. 如果是变基冲突
git rebase --continue
```

#### 冲突解决策略

```bash
# 保留当前分支的改动
git checkout --ours <file>

# 保留传入分支的改动
git checkout --theirs <file>

# 手动编辑后标记为已解决
git add <file>

# 中止合并
git merge --abort

# 中止变基
git rebase --abort
```

---

## 远程协作

### git remote - 管理远程仓库

| 命令 | 用途 |
|------|------|
| `git remote -v` | 列出所有远程仓库及其URL |
| `git remote add <name> <url>` | 添加远程仓库 |
| `git remote remove <name>` | 删除远程仓库 |
| `git remote rename <old> <new>` | 重命名远程仓库 |
| `git remote set-url <name> <url>` | 修改远程仓库地址 |
| `git remote show <name>` | 显示远程仓库详细信息 |

**典型的多远程场景：**
```bash
# 添加上游仓库（用于获取原始项目更新）
git remote add upstream https://github.com/original/repo.git

# 添加自己的fork
git remote add origin https://github.com/myname/repo.git

# 查看所有远程仓库
git remote -v

# 从上游获取最新代码
git fetch upstream
git rebase upstream/main

# 推送到自己的fork
git push origin feature/my-changes
```

### git fetch - 获取更新

```bash
# 获取所有远程更新（不合并）
git fetch origin

# 获取特定分支
git fetch origin main

# 获取所有远程更新
git fetch --all

# 获取时删除已删除的远程分支的本地跟踪
git fetch -p (--prune)
```

**fetch vs pull：**
```bash
# fetch: 只下载，不合并
git fetch origin
git log origin/main  # 查看远程分支

# pull: 下载并合并（默认使用 merge）
git pull origin main

# pull with rebase: 下载并变基
git pull --rebase origin main
```

### git pull - 获取并合并

| 选项 | 行为 |
|------|------|
| 无选项 | 获取并合并（创建合并提交） |
| `--rebase` | 获取并变基（线性历史） |
| `--ff-only` | 仅允许快进，否则失败 |

**最佳实践：**
```bash
# 配置全局使用 rebase 而不是 merge
git config --global pull.rebase true

# 对于特定仓库
git config pull.rebase true

# 执行pull操作
git pull --rebase origin main
```

### git push - 推送更新

| 命令 | 用途 | 何时使用 |
|------|------|---------|
| `git push` | 推送当前分支 | 分支有上游跟踪 |
| `git push origin <branch>` | 推送到指定远程 | 首次推送 |
| `git push -u origin <branch>` | 推送并设置上游 | 推送新分支 |
| `git push --force-with-lease` | 安全强制推送 | 变基后推送（推荐） |
| `git push --force` | 强制推送 | 覆盖远程历史（危险） |
| `git push origin --all` | 推送所有分支 | 备份所有分支 |
| `git push origin <branch> -d` | 删除远程分支 | 清理已合并的分支 |

**推送规范：**
```bash
# 场景1：首次推送新分支
git push -u origin feature/new-api

# 场景2：普通推送
git push

# 场景3：变基后推送（安全）
git rebase origin/main
git push --force-with-lease

# 场景4：删除远程分支
git push origin -d feature/old-feature

# 场景5：推送标签
git push origin v1.0.0
```

---

## 高级技巧

### git stash - 临时保存修改

**应用场景：** 需要临时切换分支，但不想提交当前修改

| 命令 | 用途 |
|------|------|
| `git stash` | 保存当前修改 |
| `git stash save "description"` | 保存并添加描述 |
| `git stash list` | 列出所有stash |
| `git stash apply` | 应用stash但保留（不删除） |
| `git stash pop` | 应用stash并删除 |
| `git stash drop` | 删除stash |
| `git stash clear` | 清空所有stash |

**工作流：**
```bash
# 场景1：正在开发功能，突然需要修复紧急bug
git stash
git checkout -b hotfix/critical-bug main
# 修复bug并提交
git checkout feature/my-feature
git stash pop

# 场景2：应用特定的stash
git stash list
git stash apply stash@{2}

# 场景3：将stash转换为分支
git stash branch feature-from-stash
```

### git cherry-pick - 选择性应用提交

**用途：** 从一个分支复制特定提交到另一个分支

```bash
# 基本用法
git cherry-pick <commit>

# 多个提交
git cherry-pick <commit1> <commit2> <commit3>

# 提交范围
git cherry-pick <commit1>..<commit2>  # 不包括 commit1
git cherry-pick <commit1>^..<commit2> # 包括 commit1

# 继续cherry-pick（有冲突时）
git cherry-pick --continue

# 中止cherry-pick
git cherry-pick --abort
```

**实际场景：**
```bash
# 场景：线上版本需要某个功能分支中的特定修复
git checkout release/v1.0
git cherry-pick abc1234  # 特定commit的hash

# 场景：从开发分支选择多个相关提交
git checkout main
git cherry-pick develop~3..develop~1
```

**Cherry-pick vs Merge vs Rebase：**
```
Cherry-pick: 精选特定提交，适合小范围集成
Merge: 整体合并分支，保留分支关系
Rebase: 改变基点，保持线性历史
```

### git reset - 撤销提交

| 选项 | 影响 | 使用场景 |
|------|------|---------|
| `--soft` | 撤销提交，修改保留在暂存区 | 修改提交信息或合并小修改 |
| `--mixed` | 撤销提交，修改保留在工作区 | 重新选择性提交修改 |
| `--hard` | 撤销提交和修改，完全回退 | 放弃所有修改，回到某个提交点 |

**工作流：**
```bash
# 场景1：修正刚才的提交（仅限未推送）
git reset --soft HEAD~1
# 修改内容
git add .
git commit -m "corrected message"

# 场景2：撤销提交但保留修改，重新选择性提交
git reset --mixed HEAD~3
# 现在可以选择性重新add和commit

# 场景3：完全回到某个提交，丢弃之后的所有修改
git reset --hard <commit>

# 场景4：仅重置一个文件
git reset --soft HEAD~1 file.txt
```

### git revert - 反向提交

**与reset的区别：** 不修改历史，而是创建新的反向提交

```bash
# 创建一个反向提交，撤销指定提交的改动
git revert <commit>

# 反向多个提交
git revert <commit1> <commit2>

# 范围反向
git revert <commit1>..<commit2>

# 反向但不提交（让用户手动提交）
git revert --no-commit <commit>

# 中止revert
git revert --abort
```

**何时使用：**
```bash
# 已推送到远程的提交，使用revert（安全）
git revert abc1234

# 本地未推送的提交，使用reset更快
git reset --hard HEAD~1
```

### git bisect - 二分查找bug

**用途：** 在多个提交中快速找到引入bug的提交

```bash
# 开始二分查找
git bisect start

# 标记当前（坏的）提交
git bisect bad

# 标记已知的好提交
git bisect good <commit>

# Git 会自动检出中间提交，测试后运行
git bisect good  # 如果这个版本没有bug
# 或
git bisect bad   # 如果这个版本有bug

# 找到bug提交后，查看详情
git bisect log

# 结束二分查找
git bisect reset
```

**自动化bisect：**
```bash
# 运行脚本来自动化bisect过程
git bisect start
git bisect bad HEAD
git bisect good v1.0
git bisect run ./test.sh  # test.sh 返回 0 表示good，非0表示bad
git bisect reset
```

### git blame - 追踪代码来源

**用途：** 查看文件的每一行是谁在什么时候修改的

```bash
# 基本用法
git blame <file>

# 显示邮箱
git blame -e <file>

# 显示行数范围
git blame -L 10,20 <file>

# 忽略空白符
git blame -w <file>

# 显示原始提交（用于追踪重构）
git blame -C <file>
```

**输出解释：**
```
abc1234 (Author Name 2024-01-15 10:30:45 +0800 10) var x = 1;

^commit^ ^author name^   ^date and time^           ^line#^ ^code^
```

### git tag - 标记重要版本

```bash
# 列出所有标签
git tag

# 创建轻量级标签
git tag v1.0.0

# 创建注释标签（推荐）
git tag -a v1.0.0 -m "Release version 1.0.0"

# 标记特定提交
git tag v1.0.0 <commit>

# 删除本地标签
git tag -d v1.0.0

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除远程标签
git push origin :v1.0.0
# 或
git push origin --delete v1.0.0

# 查看标签信息
git show v1.0.0
```

**语义化版本 (Semantic Versioning)：**
```
MAJOR.MINOR.PATCH (e.g., 1.2.3)

MAJOR: 不兼容的API变更
MINOR: 向后兼容的功能新增
PATCH: 向后兼容的bug修复

例：
1.0.0 → 1.0.1 (bug fix)
1.0.0 → 1.1.0 (新功能)
1.0.0 → 2.0.0 (破坏性变更)
```

### git worktree - 并行工作

**用途：** 在同一仓库中同时处理多个分支

```bash
# 创建新的工作树
git worktree add <path> <branch>

# 从新分支创建工作树
git worktree add -b <new-branch> <path> <start-point>

# 列出所有工作树
git worktree list

# 删除工作树
git worktree remove <path>

# 修复断开的工作树
git worktree prune
```

**工作流：**
```bash
# 场景：在开发功能时需要快速修复bug
# 项目结构：MyProject/
#          ├── main/        (主分支)
#          └── hotfix/      (新工作树)

# 1. 初始克隆到 main
mkdir MyProject && cd MyProject
git clone https://github.com/user/repo.git main

# 2. 创建 hotfix 工作树
cd main
git worktree add ../hotfix main

# 3. 在 hotfix 中进行修复
cd ../hotfix
git checkout -b hotfix/critical-bug
# 修复bug并提交

# 4. 切回 main 工作树继续开发
cd ../main
# 继续开发功能

# 5. 修复完成后删除工作树
git worktree remove ../hotfix
```

---

## 团队最佳实践

### 提交规范

**提交信息结构：**
```
<type>(<scope>): <subject> (50字以内)

<body> (每行72字以内，说明做了什么和为什么)

<footer>
Closes #123
Reviewed-by: John Doe
```

**检查清单：**
- [ ] 提交粒度适当（逻辑单元）
- [ ] 提交信息清晰有意义
- [ ] 相关的test已添加/更新
- [ ] 代码通过linting检查
- [ ] 已更新相关文档

### 代码审查工作流

```bash
# 1. 创建feature分支
git checkout -b feature/user-profile develop

# 2. 定期与develop同步
git fetch origin
git rebase origin/develop

# 3. 准备合并时，确保历史清晰
git rebase -i origin/develop
# 如需要，压缩/整理提交

# 4. 推送分支
git push -u origin feature/user-profile

# 5. 创建Pull Request (通过GitHub/GitLab UI)

# 6. 根据审查意见修改
# 修改后直接提交新提交，勿修改历史
git add .
git commit -m "Address review feedback"
git push

# 7. 审查通过后，squash合并
git checkout develop
git pull origin develop
git merge --squash feature/user-profile
git commit -m "feat: add user profile page"
git push origin develop

# 8. 删除feature分支
git branch -d feature/user-profile
git push origin -d feature/user-profile
```

### 分支保护规则

**在GitHub/GitLab中配置：**
- 要求pull request审查
- 要求通过CI/CD检查
- 禁止强制推送
- 要求分支最新
- 禁止删除分支

### Git 子模块管理

Git 子模块允许你在主项目中包含并跟踪外部仓库，同时独立维护它们的版本历史。有关完整的子模块管理、工作流和最佳实践，请参阅： [Git 子模块完整指南](./git-submodule-guide-zh-CN.md)

### Git Hooks 自动化

Git hooks 是自动化代码质量检查、测试和标准执行的重要工具。详细的 hooks 配置和使用指南请参考：

- **中文简体**: [Git Hooks 完全指南](./git-hooks-guide-zh-CN.md)
- **English**: [Complete Guide to Git Hooks](./git-hooks-guide-en.md)
- **中文繁體**: [Git Hooks 完整指南](./git-hooks-guide-zh-HK.md)

**快速开始示例：**

**使用 Husky 管理 hooks（推荐）：**
```bash
npm install husky --save-dev
npx husky install

# 添加pre-commit钩子
npx husky add .husky/pre-commit "npm run lint"

# 添加commit-msg钩子
npx husky add .husky/commit-msg "npx commitlint --edit"
```

**基础 Pre-commit 钩子（`.git/hooks/pre-commit`）：**
```bash
#!/bin/sh

# 运行 linter
eslint .
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix issues before committing."
    exit 1
fi

# 运行测试
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix issues before committing."
    exit 1
fi

exit 0
```

**Hook 类型覆盖：**
- 原生 Git hooks 配置
- Husky 现代化管理
- Commitizen 标准化提交
- Pre-commit 框架集成
- 多语言环境支持（JavaScript/TypeScript, Python, C++）
- 高级配置和最佳实践

详细配置示例和故障排除请参考上述专门的 hooks 指南。

---

## 恢复与调试

### git reflog - 恢复丢失的提交

**用途：** 查看HEAD的历史移动，恢复误删的分支或提交

```bash
# 查看所有HEAD变化
git reflog

# 查看特定分支的reflog
git reflog <branch>

# 恢复误删的分支
git reflog
# 找到想要恢复的提交hash
git checkout -b recovered-branch <hash>

# 恢复误删的提交
git reflog
git reset --hard <hash>
```

**输出理解：**
```
abc1234 HEAD@{0}: commit: Update documentation
def5678 HEAD@{1}: rebase -i: Pick
ghi9012 HEAD@{2}: checkout: moving from main to feature
...
```

### git clean - 清理工作区

```bash
# 查看将要删除的未跟踪文件（dry run）
git clean -n

# 删除未跟踪文件
git clean -f

# 删除未跟踪文件和目录
git clean -fd

# 删除忽略的文件
git clean -fX

# 删除所有未跟踪内容
git clean -fdX
```

### git fsck - 检查仓库完整性

```bash
# 检查仓库
git fsck

# 找出悬挂的对象（可能是丢失的提交）
git fsck --lost-found

# 恢复丢失的对象
git fsck --full
```

### .gitignore 最佳实践

```
# 忽略node_modules
node_modules/

# 忽略环境配置
.env
.env.local

# 忽略构建输出
dist/
build/

# 忽略IDE配置
.vscode/
.idea/
*.swp

# 忽略系统文件
.DS_Store
Thumbs.db

# 忽略日志
*.log

# 使用!来例外
!.env.example
```

---

## 故障排查

### 常见问题解决

**问题1：推送被拒绝（非快进提交）**
```bash
# 错误：failed to push some refs to
# 原因：远程有本地没有的提交

# 解决方案1：拉取并变基
git pull --rebase origin main
git push origin main

# 解决方案2：拉取并合并
git pull origin main
git push origin main
```

**问题2：提交到了错误的分支**
```bash
# 场景：应该提交到feature分支，实际提交到main

# 1. 从main获取提交hash
git log  # 记录最新提交的hash

# 2. 在main上撤销提交
git reset --soft HEAD~1

# 3. 切换到正确分支
git checkout feature/correct-branch

# 4. 重新提交
git commit -m "correct message"
```

**问题3：需要修改已推送的提交**
```bash
# 仅限小改动，且分支上没有协作者
git commit --amend
git push --force-with-lease

# 如果已有协作者，创建反向提交
git revert <commit>
git push
```

**问题4：误删本地分支**
```bash
git reflog
# 找到分支的最后一个提交
git checkout -b recovered-branch <hash>
```

---

## 性能优化

### 大型仓库优化

```bash
# 使用浅克隆
git clone --depth 1 <url>

# 克隆特定分支
git clone --single-branch -b main <url>

# 部分克隆（仅下载需要的文件）
git clone --filter=blob:none <url>

# 扩展某个分支的历史
git fetch --deepen=10

# 定期清理垃圾
git gc --aggressive
```

### 常用命令快速参考

```bash
# 日常工作
git status              # 查看状态
git add <file>          # 暂存文件
git commit -m "msg"     # 创建提交
git push                # 推送
git pull --rebase       # 拉取

# 分支管理
git checkout -b <name>  # 创建分支
git branch -d <name>    # 删除分支
git merge --no-ff <br>  # 合并分支

# 历史修改
git reset --soft HEAD~1 # 撤销提交
git revert <commit>     # 反向提交
git cherry-pick <hash>  # 选择提交

# 调试
git log --oneline       # 查看历史
git show <commit>       # 查看提交
git blame <file>        # 追踪代码
git bisect start        # 二分查找

# 恢复
git reflog              # 查看历史
git checkout <hash>     # 检出提交
git reset --hard <hash> # 硬重置
```

---

## 配置与优化

### 重要的 Git 配置

```bash
# 设置身份信息（必须）
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 设置默认编辑器
git config --global core.editor "vim"

# 使用rebase作为默认pull策略
git config --global pull.rebase true

# 配置快速别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'

# 启用颜色输出
git config --global color.ui true

# 配置合并工具
git config --global merge.tool vimdiff

# 查看所有配置
git config --list

# 编辑全局配置文件
git config --global --edit
```

### 高效的 git 别名

```bash
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'
git config --global alias.amend 'commit --amend --no-edit'
git config --global alias.undo 'reset --soft HEAD~1'
git config --global alias.stash-all 'stash save --include-untracked'
```

---

## 总结与建议

### 核心原则
1. **频繁提交**：小的、逻辑相关的提交便于追踪和回滚
2. **清晰的提交信息**：帮助团队理解变更意图
3. **定期同步**：避免长期分支导致复杂冲突
4. **保护主干**：主分支应始终稳定可发布
5. **使用工作流**：团队遵循一致的流程

### 分支生命周期建议
- Feature 分支：1-5 天
- Release 分支：1-2 周
- Hotfix 分支：数小时到1天
- 删除已合并的分支：定期清理

### 何时使用各种命令
| 场景 | 推荐命令 |
|------|---------|
| 日常更新 | `git pull --rebase` |
| 合并功能 | `git merge --no-ff` |
| 整理历史 | `git rebase -i` |
| 选择提交 | `git cherry-pick` |
| 紧急修复 | `git worktree` + `git hotfix` |
| 追踪问题 | `git bisect` + `git blame` |

---

## 资源与进阶

### 官方文档
- Git 官方文档：https://git-scm.com/doc
- GitHub 文档：https://docs.github.com
- GitLab 文档：https://docs.gitlab.com

### 学习资源
- "Pro Git" 书籍（免费在线版）
- Git 可视化学习：https://learngitbranching.js.org/
- GitHub Skills：https://skills.github.com/
