# Git 工程實踐完整指南

## 目錄
1. [基本指令與工作流程](#基本指令與工作流程)
2. [分支管理策略](#分支管理策略)
3. [提交與歷史管理](#提交與歷史管理)
4. [合併與衝突解決](#合併與衝突解決)
5. [遠端協作](#遠端協作)
6. [進階技巧](#進階技巧)
7. [團隊最佳實踐](#團隊最佳實踐)
8. [恢復與除錯](#恢復與除錯)

---

## 基本指令與工作流程

### 初始化與複製

| 指令 | 選項 | 場景 | 最佳實踐 |
|------|------|------|----------|
| `git init` | `--initial-branch=<name>` | 初始化本地倉庫 | 新建專案時使用，指定預設分支名稱 |
| `git clone <url>` | `--depth 1` | 複製遠端倉庫 | 大型倉庫建議用 --depth 1 加快速度 |
| `git clone <url>` | `-b <branch>` | 複製指定分支 | 只複製所需分支，避免下載全部分支 |

**最佳實踐：**
```bash
# 複製大型專案（淺層複製）
git clone --depth 1 https://github.com/user/repo.git

# 複製指定分支
git clone -b develop https://github.com/user/repo.git
```

### 基本工作流程指令

#### git add - 暫存變更

| 選項 | 目的 | 何時使用 |
|------|------|----------|
| `git add .` | 加入所有變更 | 需提交所有變更時 |
| `git add <file>` | 加入單一檔案 | 選擇性提交檔案時 |
| `git add -p` | 互動式暫存 | 只提交部分檔案、分開邏輯變更時 |
| `git add -u` | 暫存已修改/刪除 | 更新已追蹤檔案，不加入新檔案 |
| `git add -A` | 暫存所有變更 | 包含新、改、刪檔案 |

**場景：**
```bash
# 場景1：功能完成，提交所有變更
git add .
git commit -m "feat: add user authentication"

# 場景2：同一檔案多個不相關變更，需分開提交
git add -p
# 互動式選擇暫存內容

# 場景3：只提交已追蹤檔案的變更
git add -u
```

#### git commit - 建立提交

| 選項 | 目的 | 場景 |
|------|------|------|
| `git commit -m "<msg>"` | 快速提交 | 簡單、小變更 |
| `git commit` | 開啟編輯器 | 撰寫詳細提交訊息 |
| `git commit --amend` | 修正上一個提交 | 修正未推送的提交 |
| `git commit --amend --no-edit` | 修正提交，保留訊息 | 補加遺漏檔案到提交 |
| `git commit -v` | 顯示 diff | 確認暫存內容 |

**提交訊息慣例（Conventional Commits）：**
```
<type>(<scope>): <subject>

<body>

<footer>

範例：
feat(auth): implement JWT authentication
- Add JWT token generation
- Add token validation middleware
- Update user model

Closes #123
```

**提交類型：**
- `feat`: 新功能
- `fix`: 修復錯誤
- `docs`: 文件變更
- `style`: 程式碼風格（無邏輯變更）
- `refactor`: 重構
- `test`: 新增/修改測試
- `chore`: 建置、依賴、工具設定

---

## 分支管理策略

### Git Flow 工作流程

適用於：有定期發佈計劃的專案

**分支類型：**

| 類型 | 命名 | 目的 | 生命週期 |
|------|------|------|----------|
| `main` | - | 生產環境穩定代碼 | 長期 |
| `develop` | - | 開發、整合 | 長期 |
| `feature/*` | `feature/user-auth` | 新功能開發 | 臨時 |
| `release/*` | `release/1.0.0` | 發佈前準備 | 臨時 |
| `hotfix/*` | `hotfix/critical-bug` | 緊急修復 | 臨時 |

**工作流程步驟：**
```bash
# 1. 建立功能分支
git checkout -b feature/user-dashboard develop

# 2. 開發完成，推送到遠端
git push -u origin feature/user-dashboard

# 3. 建立 Pull Request 進行程式碼審查

# 4. 審查後合併到 develop
git checkout develop
git pull origin develop
git merge --no-ff feature/user-dashboard
git push origin develop

# 5. 刪除功能分支
git branch -d feature/user-dashboard
git push origin -d feature/user-dashboard

# 6. 準備發佈，從 develop 建立 release 分支
git checkout -b release/1.2.0 develop
# 更新版本、修正錯誤、更新 changelog
git commit -am "bump version to 1.2.0"

# 7. 發佈後，合併到 main 與 develop
git checkout main
git pull origin main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git pull origin develop
git merge --no-ff release/1.2.0
git push origin develop

# 8. 刪除 release 分支
git branch -d release/1.2.0
```

### GitHub Flow 工作流程

適用於：持續部署、簡單專案

**特點：** 流程簡化，main 分支隨時可部署

```bash
# 1. 從 main 建立功能分支
git checkout -b feature/new-api main

# 2. 完成功能開發
git add .
git commit -m "feat: add API endpoint"
git push -u origin feature/new-api

# 3. 建立 Pull Request

# 4. 通過 CI/CD 測試後合併
git checkout main
git pull origin main
git merge --no-ff feature/new-api
git push origin main

# 5. 自動或手動刪除分支
git branch -d feature/new-api
```

### Trunk-Based Development

適用於：高頻率發佈、大型團隊

**特點：** 分支短命，頻繁合併到主幹

```bash
# 1. 從 main 建立短命分支
git checkout -b fb-short-lived main

# 2. 快速迭代（1-2天內完成）
git add .
git commit -m "wip: work in progress"
git push origin fb-short-lived

# 3. 通過 CI 後立即合併（可用 feature flag 控制）
git checkout main
git pull origin main
git merge --ff fb-short-lived  # 快進合併，保持線性歷史
git push origin main

# 4. 刪除短命分支
git branch -d fb-short-lived
```

### 分支管理指令

| 指令 | 選項 | 目的 |
|------|------|------|
| `git branch` | `-a` | 列出所有本地與遠端分支 |
| `git branch -vv` | - | 顯示本地/遠端追蹤 |
| `git branch <name>` | - | 建立新分支 |
| `git branch -d <name>` | - | 刪除分支（安全，未合併會拒絕） |
| `git branch -D <name>` | - | 強制刪除分支 |
| `git branch -m <old> <new>` | - | 重新命名分支 |
| `git checkout <branch>` | - | 切換分支（舊方式） |
| `git switch <branch>` | - | 切換分支（新，推薦） |
| `git switch -c <branch>` | - | 建立並切換新分支 |

---

## 提交與歷史管理

### git status - 查看狀態

```bash
# 簡短輸出
git status -s

# 分支追蹤資訊
git status -b

# 詳細資訊（預設）
git status
```

**輸出說明：**
```
 M file.txt          # 已修改（未暫存）
M  file.txt          # 已修改（已暫存）
A  newfile.txt       # 新檔案（已暫存）
D  deleted.txt       # 已刪除（已暫存）
?? untracked.txt     # 未追蹤檔案
```

### git diff - 查看變更

| 指令 | 比較 | 目的 | 何時使用 |
|------|------|------|----------|
| `git diff` | 工作目錄 vs 暫存區 | 查看未暫存變更 | 提交前檢查 |
| `git diff --staged` | 暫存區 vs HEAD | 查看已暫存變更 | 提交前最終檢查 |
| `git diff HEAD` | 工作目錄 vs HEAD | 查看所有未提交變更 | 全局檢查 |
| `git diff <branch1> <branch2>` | 分支比較 | 比較分支 | 合併前預覽 |
| `git diff <commit1> <commit2>` | 提交比較 | 比較提交 | 歷史變更檢查 |

**常用選項：**
```bash
# 只顯示檔名
git diff --name-only

# 顯示統計
git diff --stat

# 查看指定檔案 diff
git diff <file>

# 字級 diff（更細緻）
git diff --word-diff

# 顯示行增減統計
git diff --numstat
```

### git log - 查看歷史

| 選項 | 目的 | 場景 |
|------|------|------|
| `git log --oneline` | 單行簡潔 | 快速瀏覽歷史 |
| `git log --graph --decorate` | 分支圖 | 理解分支結構 |
| `git log --all --graph --oneline` | 全分支圖 | 查看所有分支歷史 |
| `git log -p` | 顯示每次提交 diff | 詳細檢查 |
| `git log --stat` | 顯示檔案變更統計 | 理解變更範圍 |
| `git log --author="name"` | 依作者篩選 | 查看特定人提交 |
| `git log --since="2024-01-01"` | 依時間篩選 | 查看特定期間提交 |
| `git log --grep="pattern"` | 依訊息篩選 | 查找相關功能提交 |
| `git log -S"string"` | 搜尋程式內容 | 追蹤程式碼引入 |

**範例：**
```bash
# 查看最近10次提交詳情
git log -10 -p

# 查看所有 feat 類型提交
git log --grep="feat" --oneline

# 查看檔案歷史
git log -- file.txt

# 查看 main 有但 develop 沒有的提交
git log develop..main

# 查誰在某日期後改過檔案
git log --since="2024-01-01" -- file.txt

# 自訂輸出格式
git log --pretty=format:"%h - %an, %ar : %s"
```

**常用格式指令：**
```
%h    - 短提交雜湊
%an   - 作者名稱
%ae   - 作者電郵
%ad   - 作者日期
%ar   - 相對日期
%s    - 提交主旨
%b    - 提交內容
```

### git show - 查看提交詳情

```bash
# 查看提交詳情與變更
git show <commit>

# 查看提交中的檔案內容
git show <commit>:<file>

# 查看提交統計
git show --stat <commit>
```

---

## 合併與衝突解決

### git merge - 合併分支

| 選項 | 結果 | 何時使用 |
|------|------|----------|
| `git merge <branch>` | 產生合併提交 | 保留分支歷史 |
| `git merge --no-ff <branch>` | 強制產生合併提交 | 功能分支合併，保留記錄 |
| `git merge --ff-only <branch>` | 只允許快進合併 | 保持線性歷史 |
| `git merge --squash <branch>` | 壓縮為單一提交 | 清理功能分支歷史 |

**合併工作流程：**
```bash
# 場景1：合併功能分支，保留歷史
git checkout develop
git pull origin develop
git merge --no-ff feature/new-api
git push origin develop

# 場景2：合併前檢查衝突
git merge --no-commit --no-ff feature/new-api
# 檢查狀態
git status
# 放棄合併
git merge --abort

# 場景3：壓縮多個提交
git merge --squash feature/new-api
git commit -m "feat: add new API endpoint"
```

### git rebase - 變基

**用途：** 保持線性歷史，避免合併提交

| 目的 | 指令 | 何時使用 |
|------|------|----------|
| 基本變基 | `git rebase <branch>` | 更新分支到最新 main |
| 互動式變基 | `git rebase -i HEAD~5` | 重組、壓縮提交 |
| 繼續/放棄 | `git rebase --continue` | 衝突解決後繼續 |
| | `git rebase --abort` | 放棄變基 |

**變基工作流程：**
```bash
# 場景1：保持線性歷史
git fetch origin
git rebase origin/main
# 若有衝突，解決後繼續
git rebase --continue

# 場景2：壓縮多個提交（互動式）
git rebase -i HEAD~3
# 編輯器操作：
# p pick      - 保留提交
# r reword    - 保留，編輯訊息
# s squash    - 合併到前一個
# f fixup     - 合併，捨棄訊息
# e edit      - 停下來編輯
# d drop      - 刪除提交

# 場景3：更改早期提交作者
git rebase -i <commit>^
# 改為 e (edit)
git commit --amend --author="Name <email@example.com>"
git rebase --continue
```

**合併 vs 變基比較：**

| 特點 | 合併 | 變基 |
|------|------|------|
| 歷史 | 保留分支資訊 | 線性歷史 |
| 安全性 | 高（不重寫） | 謹慎使用（重寫歷史） |
| 可讀性 | 分支清晰 | 簡單直接 |
| 協作 | 適合共用分支 | 僅限本地分支 |
| 衝突處理 | 一次解決 | 每次提交解決 |

**最佳實踐：**
```
- 本地分支：用 rebase 保持線性
- 共用分支：用 merge 保留歷史
- 公開發佈：切勿 rebase 已推送提交
```

### 衝突解決

#### 辨識衝突

```bash
# 衝突標記格式
<<<<<<< HEAD
你的變更
=======
其他分支變更
>>>>>>> branch-name
```

#### 解決衝突步驟

```bash
# 1. 查看有衝突檔案
git status

# 2. 編輯檔案，選擇保留內容

# 3. 標記為已解決
git add <resolved-file>

# 4. 合併衝突提交
git commit -m "Resolve merge conflicts"

# 5. 變基衝突繼續
git rebase --continue
```

#### 衝突解決策略

```bash
# 保留本分支變更
git checkout --ours <file>

# 保留對方分支變更
git checkout --theirs <file>

# 手動編輯後標記已解決
git add <file>

# 放棄合併
git merge --abort

# 放棄變基
git rebase --abort
```

---

## 遠端協作

### git remote - 管理遠端

| 指令 | 目的 |
|------|------|
| `git remote -v` | 列出所有遠端及 URL |
| `git remote add <name> <url>` | 新增遠端 |
| `git remote remove <name>` | 移除遠端 |
| `git remote rename <old> <new>` | 重新命名遠端 |
| `git remote set-url <name> <url>` | 更改遠端 URL |
| `git remote show <name>` | 顯示遠端詳情 |

**多遠端場景範例：**
```bash
# 新增 upstream（原專案更新）
git remote add upstream https://github.com/original/repo.git

# 新增自己的 fork
git remote add origin https://github.com/myname/repo.git

# 列出所有遠端
git remote -v

# 從 upstream 取最新
git fetch upstream
git rebase upstream/main

# 推送到自己的 fork
git push origin feature/my-changes
```

### git fetch - 取得更新

```bash
# 取回所有遠端更新（不合併）
git fetch origin

# 取回指定分支
git fetch origin main

# 取回所有遠端
git fetch --all

# 清理已刪除遠端分支
git fetch -p (--prune)
```

**fetch vs pull：**
```bash
# fetch：只下載不合併
git fetch origin
git log origin/main  # 查看遠端分支

# pull：下載並合併（預設為合併）
git pull origin main

# pull 並 rebase：下載並變基
git pull --rebase origin main
```

### git pull - 取得並合併

| 選項 | 行為 |
|------|------|
| 無選項 | 取回並合併（產生合併提交） |
| `--rebase` | 取回並變基（線性歷史） |
| `--ff-only` | 只允許快進，否則失敗 |

**最佳實踐：**
```bash
# 全域設為預設 rebase
git config --global pull.rebase true

# 指定倉庫設為 rebase
git config pull.rebase true

# pull 操作
git pull --rebase origin main
```

### git push - 推送更新

| 指令 | 目的 | 何時使用 |
|------|------|----------|
| `git push` | 推送目前分支 | 分支有 upstream 追蹤時 |
| `git push origin <branch>` | 推送到指定遠端 | 第一次推送 |
| `git push -u origin <branch>` | 推送並設為 upstream | 新分支第一次推送 |
| `git push --force-with-lease` | 安全強制推送 | 變基後（推薦） |
| `git push --force` | 強制推送 | 覆蓋遠端歷史（危險） |
| `git push origin --all` | 推送所有分支 | 備份所有分支 |
| `git push origin <branch> -d` | 刪除遠端分支 | 清理已合併分支 |

**推送指引：**
```bash
# 場景1：新分支第一次推送
git push -u origin feature/new-api

# 場景2：一般推送
git push

# 場景3：變基後安全強制推送
git rebase origin/main
git push --force-with-lease

# 場景4：刪除遠端分支
git push origin -d feature/old-feature

# 場景5：推送標籤
git push origin v1.0.0
```

---

## 進階技巧

### git stash - 暫存變更

**用途：** 需臨時切換分支，不想提交當前變更

| 指令 | 目的 |
|------|------|
| `git stash` | 暫存當前變更 |
| `git stash save "description"` | 以描述暫存 |
| `git stash list` | 列出所有暫存 |
| `git stash apply` | 套用暫存，保留暫存 |
| `git stash pop` | 套用並移除暫存 |
| `git stash drop` | 刪除暫存 |
| `git stash clear` | 清除所有暫存 |

**工作流程：**
```bash
# 場景1：開發中需緊急修 bug
git stash
git checkout -b hotfix/critical-bug main
# 修 bug 並提交
git checkout feature/my-feature
git stash pop

# 場景2：套用指定暫存
git stash list
git stash apply stash@{2}

# 場景3：將暫存轉為分支
git stash branch feature-from-stash
```

### git cherry-pick - 選擇性套用提交

**用途：** 從其他分支複製特定提交

```bash
# 基本用法
git cherry-pick <commit>

# 多個提交
git cherry-pick <commit1> <commit2> <commit3>

# 提交範圍
git cherry-pick <commit1>..<commit2>  # 不含 commit1
git cherry-pick <commit1>^..<commit2> # 包含 commit1

# 衝突後繼續
git cherry-pick --continue

# 放棄 cherry-pick
git cherry-pick --abort
```

**場景：**
```bash
# 場景：生產環境需套用 feature 分支特定修正
git checkout release/v1.0
git cherry-pick abc1234  # 指定提交雜湊

# 場景：從 develop 選多個相關提交
git checkout main
git cherry-pick develop~3..develop~1
```

**cherry-pick vs merge vs rebase：**
```
cherry-pick：選擇性套用提交，適合小型整合
merge：合併整個分支，保留分支關係
rebase：更改基底，保持線性歷史
```

### git reset - 撤銷提交

| 選項 | 效果 | 用途 |
|------|------|------|
| `--soft` | 撤銷提交，保留暫存 | 編輯提交訊息或合併小變更 |
| `--mixed` | 撤銷提交，保留工作目錄 | 選擇性重新提交變更 |
| `--hard` | 撤銷提交與變更，完全重設 | 丟棄所有變更，回到指定提交 |

**工作流程：**
```bash
# 場景1：修正上一個提交（未推送）
git reset --soft HEAD~1
# 編輯內容
git add .
git commit -m "corrected message"

# 場景2：撤銷提交，保留變更，重新選擇提交
git reset --mixed HEAD~3
# 現在可選擇性加入與提交

# 場景3：完全重設到某提交，丟棄所有變更
git reset --hard <commit>

# 場景4：只重設單一檔案
git reset --soft HEAD~1 file.txt
```

### git revert - 反向提交

**與 reset 差異：** 不更改歷史，產生新反向提交

```bash
# 產生反向提交，撤銷指定提交
git revert <commit>

# 反向多個提交
git revert <commit1> <commit2>

# 範圍反向
git revert <commit1>..<commit2>

# 不自動提交（讓用戶自行提交）
git revert --no-commit <commit>

# 放棄 revert
git revert --abort
```

**何時使用：**
```bash
# 已推送的提交，建議用 revert（安全）
git revert abc1234

# 本地未推送的提交，用 reset
git reset --hard HEAD~1
```

### git bisect - 二分搜尋錯誤

**用途：** 快速找出引入 bug 的提交

```bash
# 開始 bisect
git bisect start

# 標記目前（有 bug）提交
git bisect bad

# 標記已知正常提交
git bisect good <commit>

# Git 會 checkout 中間提交，測試後執行
git bisect good  # 若此版本正常
# 或
git bisect bad   # 若此版本有 bug

# 找到 bug 提交後，查看詳情
git bisect log

# 結束 bisect
git bisect reset
```

**自動化 bisect：**
```bash
# 執行腳本自動 bisect
git bisect start
git bisect bad HEAD
git bisect good v1.0
git bisect run ./test.sh  # test.sh 回傳 0 為正常，非 0 為有 bug
git bisect reset
```

### git blame - 追蹤程式來源

**用途：** 查看每行程式誰在何時修改

```bash
# 基本用法
git blame <file>

# 顯示 email
git blame -e <file>

# 顯示行範圍
git blame -L 10,20 <file>

# 忽略空白差異
git blame -w <file>

# 顯示原始提交（追蹤重構）
git blame -C <file>
```

**輸出說明：**
```
abc1234 (Author Name 2024-01-15 10:30:45 +0800 10) var x = 1;

^提交^ ^作者^   ^日期時間^           ^行號^ ^程式碼^
```

### git tag - 標記重要版本

```bash
# 列出所有標籤
git tag

# 建立輕量標籤
git tag v1.0.0

# 建立註解標籤（推薦）
git tag -a v1.0.0 -m "Release version 1.0.0"

# 標記指定提交
git tag v1.0.0 <commit>

# 刪除本地標籤
git tag -d v1.0.0

# 推送標籤到遠端
git push origin v1.0.0

# 推送所有標籤
git push origin --tags

# 刪除遠端標籤
git push origin :v1.0.0
# 或
git push origin --delete v1.0.0

# 查看標籤資訊
git show v1.0.0
```

**語意化版本：**
```
主.次.修（如 1.2.3）

主：破壞性 API 變更
次：向下相容新功能
修：向下相容修正

範例：
1.0.0 → 1.0.1（修正）
1.0.0 → 1.1.0（新功能）
1.0.0 → 2.0.0（破壞性變更）
```

### git worktree - 平行工作

**用途：** 同一倉庫多分支同時作業

```bash
# 建立新 worktree
git worktree add <path> <branch>

# 由新分支建立 worktree
git worktree add -b <new-branch> <path> <start-point>

# 列出所有 worktree
git worktree list

# 移除 worktree
git worktree remove <path>

# 清理損壞 worktree
git worktree prune
```

**工作流程：**
```bash
# 場景：需在開發功能同時修 bug
# 專案結構：MyProject/
#                   ├── main/        (main 分支)
#                   └── hotfix/      (新 worktree)

# 1. 初始 clone 到 main
mkdir MyProject && cd MyProject
git clone https://github.com/user/repo.git main

# 2. 建立 hotfix worktree
cd main
git worktree add ../hotfix main

# 3. 在 hotfix 修 bug
cd ../hotfix
git checkout -b hotfix/critical-bug
# 修 bug 並提交

# 4. 回 main worktree 繼續開發
git checkout main
# 繼續功能開發

# 5. 修復後移除 worktree
git worktree remove ../hotfix
```

---

## 團隊最佳實踐

### 提交指引

**提交訊息結構：**
```
<type>(<scope>): <subject>（50字內）

<body>（每行72字內，說明內容/原因）

<footer>
Closes #123
Reviewed-by: John Doe
```

**檢查清單：**
- [ ] 適當提交粒度（邏輯單元）
- [ ] 訊息清晰有意義
- [ ] 相關測試已新增/更新
- [ ] 程式碼通過 lint
- [ ] 文件已更新

### 程式碼審查流程

```bash
# 1. 建立功能分支
git checkout -b feature/user-profile develop

# 2. 定期與 develop 同步
git fetch origin
git rebase origin/develop

# 3. 合併前確保歷史乾淨
git rebase -i origin/develop
# 壓縮/清理提交

# 4. 推送分支
git push -u origin feature/user-profile

# 5. 建立 Pull Request（GitHub/GitLab UI）

# 6. 處理審查意見
# 新增新提交，不重寫歷史
git add .
git commit -m "Address review feedback"
git push

# 7. 審查通過後，squash 合併
git checkout develop
git pull origin develop
git merge --squash feature/user-profile
git commit -m "feat: add user profile page"
git push origin develop

# 8. 刪除功能分支
git branch -d feature/user-profile
git push origin -d feature/user-profile
```

### 分支保護規則

**於 GitHub/GitLab 設定：**
- 需 Pull Request 審查
- 需 CI/CD 檢查
- 禁止強制推送
- 需分支為最新
- 防止分支被刪除

### Git Hooks 自動化

**Pre-commit hook（`.git/hooks/pre-commit`）：**
```bash
#!/bin/sh

# 執行 linter
eslint .
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix issues before committing."
    exit 1
fi

# 執行測試
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix issues before committing."
    exit 1
fi

exit 0
```

**建議用 Husky 管理 hooks：**
```bash
npm install husky --save-dev
npx husky install

# 新增 pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# 新增 commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit"
```

---

## 恢復與除錯

### git reflog - 恢復遺失提交

**用途：** 查看 HEAD 歷史，恢復刪除分支/提交

```bash
# 查看所有 HEAD 變更
git reflog

# 查看分支 reflog
git reflog <branch>

# 恢復刪除分支
git reflog
# 找到要恢復的 commit hash
git checkout -b recovered-branch <hash>

# 恢復刪除提交
git reflog
git reset --hard <hash>
```

**輸出說明：**
```
abc1234 HEAD@{0}: commit: Update documentation
def5678 HEAD@{1}: rebase -i: Pick
ghi9012 HEAD@{2}: checkout: moving from main to feature
...
```

### git clean - 清理工作目錄

```bash
# 預覽將被刪除檔案（模擬）
git clean -n

# 刪除未追蹤檔案
git clean -f

# 刪除未追蹤檔案與資料夾
git clean -fd

# 刪除被忽略檔案
git clean -fX

# 刪除所有未追蹤內容
git clean -fdX
```

### git fsck - 檢查倉庫完整性

```bash
# 檢查倉庫
git fsck

# 找出懸空物件（可能遺失提交）
git fsck --lost-found

# 恢復遺失物件
git fsck --full
```

### .gitignore 最佳實踐

```
# 忽略 node_modules
node_modules/

# 忽略環境設定
.env
.env.local

# 忽略建置輸出
dist/
build/

# 忽略 IDE 設定
.vscode/
.idea/
*.swp

# 忽略系統檔案
.DS_Store
Thumbs.db

# 忽略日誌
*.log

# 用 ! 例外
!.env.example
```

---

## 疑難排解

### 常見問題與解決方案

**問題1：推送被拒（非快進）**
```bash
# 錯誤：failed to push some refs to
# 原因：遠端有本地沒有的提交

# 解法1：拉取並 rebase
git pull --rebase origin main
git push origin main

# 解法2：拉取並合併
git pull origin main
git push origin main
```

**問題2：提交到錯誤分支**
```bash
# 場景：應該提交到 feature 分支，卻提交到 main

# 1. 取得 main 的提交 hash
git log  # 記下最新提交 hash

# 2. 撤銷 main 的提交
git reset --soft HEAD~1

# 3. 切換到正確分支
git checkout feature/correct-branch

# 4. 重新提交
git commit -m "correct message"
```

**問題3：需編輯已推送提交**
```bash
# 僅限小變更、無協作者
git commit --amend
git push --force-with-lease

# 有協作者，請建立反向提交
git revert <commit>
git push
```

**問題4：誤刪本地分支**
```bash
git reflog
# 找到分支最後提交
git checkout -b recovered-branch <hash>
```

---

## 效能優化

### 大型倉庫優化

```bash
# 使用淺層複製
git clone --depth 1 <url>

# 複製指定分支
git clone --single-branch -b main <url>

# 部分複製（只下載需要的檔案）
git clone --filter=blob:none <url>

# 加深分支歷史
git fetch --deepen=10

# 定期清理
git gc --aggressive
```

### 常用指令速查

```bash
# 日常工作
git status              # 查看狀態
git add <file>          # 暫存檔案
git commit -m "msg"     # 建立提交
git push                # 推送
git pull --rebase       # 拉取

# 分支管理
git checkout -b <name>  # 建立分支
git branch -d <name>    # 刪除分支
git merge --no-ff <br>  # 合併分支

# 歷史變更
git reset --soft HEAD~1 # 撤銷提交
git revert <commit>     # 反向提交
git cherry-pick <hash>  # 選擇提交

# 除錯
git log --oneline       # 查看歷史
git show <commit>       # 查看提交
git blame <file>        # 追蹤程式
git bisect start        # 二分搜尋

# 恢復
git reflog              # 查看歷史
git checkout <hash>     # 切換提交
git reset --hard <hash> # 強制重設
```

---

## 設定與優化

### 重要 Git 設定

```bash
# 設定身份（必需）
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 設定預設編輯器
git config --global core.editor "vim"

# 設定預設 pull 策略為 rebase
git config --global pull.rebase true

# 設定常用別名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'

# 啟用彩色輸出
git config --global color.ui true

# 設定合併工具
git config --global merge.tool vimdiff

# 查看所有設定
git config --list

# 編輯全域設定檔
git config --global --edit
```

### 高效 Git 別名

```bash
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'
git config --global alias.amend 'commit --amend --no-edit'
git config --global alias.undo 'reset --soft HEAD~1'
git config --global alias.stash-all 'stash save --include-untracked'
```

---

## 摘要與建議

### 核心原則
1. **頻繁提交**：小且邏輯相關的提交易於追蹤與回溯
2. **清晰提交訊息**：幫助團隊理解變更意圖
3. **定期同步**：避免長期分支與複雜衝突
4. **保護主幹**：main 分支應隨時穩定可發佈
5. **使用工作流程**：團隊遵循一致流程

### 分支生命週期建議
- 功能分支：1-5天
- 發佈分支：1-2週
- 熱修分支：數小時至1天
- 合併後刪除分支：定期清理

### 各場景推薦指令
| 場景 | 推薦指令 |
|------|----------|
| 日常更新 | `git pull --rebase` |
| 合併功能 | `git merge --no-ff` |
| 清理歷史 | `git rebase -i` |
| 選擇提交 | `git cherry-pick` |
| 緊急修復 | `git worktree` + `git hotfix` |
| 追蹤問題 | `git bisect` + `git blame` |

---

## 資源與進階

### 官方文件
- Git 官方文件：https://git-scm.com/doc
- GitHub 文件：https://docs.github.com
- GitLab 文件：https://docs.gitlab.com

### 學習資源
- 《Pro Git》電子書（免費）
- Git 視覺化學習：https://learngitbranching.js.org/
- GitHub Skills：https://skills.github.com/
