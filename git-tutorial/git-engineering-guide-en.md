# Complete Guide to Git Engineering Practices

## Table of Contents
1. [Basic Commands & Workflow](#basic-commands--workflow)
2. [Branch Management Strategies](#branch-management-strategies)
3. [Commit & History Management](#commit--history-management)
4. [Merging & Conflict Resolution](#merging--conflict-resolution)
5. [Remote Collaboration](#remote-collaboration)
6. [Advanced Techniques](#advanced-techniques)
7. [Team Best Practices](#team-best-practices)
8. [Recovery & Debugging](#recovery--debugging)

---

## Basic Commands & Workflow

### Initialization & Cloning

| Command | Option | Scenario | Best Practice |
|---------|--------|----------|--------------|
| `git init` | `--initial-branch=<name>` | Initialize local repo | Use when creating a new project, specify default branch name |
| `git clone <url>` | `--depth 1` | Clone remote repo | For large repos, use --depth 1 for shallow clone to speed up |
| `git clone <url>` | `-b <branch>` | Clone specific branch | Only clone needed branch, avoid downloading all branches |

**Best Practices:**
```bash
# Shallow clone large projects
git clone --depth 1 https://github.com/user/repo.git

# Clone a specific branch
git clone -b develop https://github.com/user/repo.git
```

### Basic Workflow Commands

#### git add - Stage Changes

| Option | Purpose | When to Use |
|--------|---------|-------------|
| `git add .` | Add all changes | When all changes should be committed |
| `git add <file>` | Add single file | Select files to commit |
| `git add -p` | Interactive staging | Commit only part of file, separate logic changes |
| `git add -u` | Stage modified/deleted | Update tracked files, don't add new files |
| `git add -A` | Stage all changes | Include new, modified, and deleted files |

**Scenarios:**
```bash
# Scenario 1: Feature complete, commit all changes
git add .
git commit -m "feat: add user authentication"

# Scenario 2: Multiple unrelated changes in one file, need to separate
git add -p
# Interactively select changes to stage

# Scenario 3: Only commit changes to tracked files
git add -u
```

#### git commit - Create Commit

| Option | Purpose | Scenario |
|--------|---------|----------|
| `git commit -m "<msg>"` | Quick commit | Simple, small changes |
| `git commit` | Open editor | Write detailed commit message |
| `git commit --amend` | Amend last commit | Fix previous commit (only if not pushed) |
| `git commit --amend --no-edit` | Amend commit, keep message | Add missed files to commit |
| `git commit -v` | Show diff | Confirm staged content |

**Commit Message Convention (Conventional Commits):**
```
<type>(<scope>): <subject>

<body>

<footer>

Example:
feat(auth): implement JWT authentication
- Add JWT token generation
- Add token validation middleware
- Update user model

Closes #123
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation change
- `style`: Code style (no logic change)
- `refactor`: Code refactor
- `test`: Add/modify tests
- `chore`: Build, dependencies, tool config

**Automated Commit Message Validation:**
You can use Git hooks to automatically validate commit message formats, ensuring team adherence to unified commit standards. For detailed configuration, refer to Commitizen and commitlint sections in the [Complete Guide to Git Hooks](./git-hooks-guide-en.md).

---

## Branch Management Strategies

### Git Flow Workflow

Suitable for: Projects with regular release schedules

**Branch Types:**

| Type | Naming | Purpose | Lifecycle |
|------|--------|---------|-----------|
| `main` | - | Production code, stable | Long-term |
| `develop` | - | Development, integration | Long-term |
| `feature/*` | `feature/user-auth` | New feature development | Temporary |
| `release/*` | `release/1.0.0` | Pre-release prep | Temporary |
| `hotfix/*` | `hotfix/critical-bug` | Emergency fix | Temporary |

**Workflow Steps:**
```bash
# 1. Create feature branch
git checkout -b feature/user-dashboard develop

# 2. Finish development, push to remote
git push -u origin feature/user-dashboard

# 3. Create Pull Request for code review

# 4. After review, merge to develop
git checkout develop
git pull origin develop
git merge --no-ff feature/user-dashboard
git push origin develop

# 5. Delete feature branch
git branch -d feature/user-dashboard
git push origin -d feature/user-dashboard

# 6. Prepare release, create release branch from develop
git checkout -b release/1.2.0 develop
# Update version, fix bugs, update changelog
git commit -am "bump version to 1.2.0"

# 7. After release, merge to main and develop
git checkout main
git pull origin main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git pull origin develop
git merge --no-ff release/1.2.0
git push origin develop

# 8. Delete release branch
git branch -d release/1.2.0
```

### GitHub Flow Workflow

Suitable for: Continuous deployment, simple projects

**Features:** Simplified process, main branch always deployable

```bash
# 1. Create feature branch from main
git checkout -b feature/new-api main

# 2. Finish development
git add .
git commit -m "feat: add API endpoint"
git push -u origin feature/new-api

# 3. Create Pull Request

# 4. After CI/CD tests, merge
git checkout main
git pull origin main
git merge --no-ff feature/new-api
git push origin main

# 5. Delete branch automatically or manually
git branch -d feature/new-api
```

### Trunk-Based Development

Suitable for: High-frequency releases, large teams

**Features:** Short-lived branches, frequent merges to trunk

```bash
# 1. Create short-lived branch from main
git checkout -b fb-short-lived main

# 2. Fast iteration (complete in 1-2 days)
git add .
git commit -m "wip: work in progress"
git push origin fb-short-lived

# 3. After CI, merge immediately (use feature flag for visibility)
git checkout main
git pull origin main
git merge --ff fb-short-lived  # Fast-forward merge for linear history
git push origin main

# 4. Delete short-lived branch
git branch -d fb-short-lived
```

### Branch Management Commands

| Command | Option | Purpose |
|---------|--------|---------|
| `git branch` | `-a` | List all local and remote branches |
| `git branch -vv` | - | Show local/remote tracking |
| `git branch <name>` | - | Create new branch |
| `git branch -d <name>` | - | Delete branch (safe, refuses if not merged) |
| `git branch -D <name>` | - | Force delete branch |
| `git branch -m <old> <new>` | - | Rename branch |
| `git checkout <branch>` | - | Switch branch (old way) |
| `git switch <branch>` | - | Switch branch (new, recommended) |
| `git switch -c <branch>` | - | Create and switch to new branch |

---

## Commit & History Management

### git status - View Status

```bash
# Short output
git status -s

# Branch tracking info
git status -b

# Detailed info (default)
git status
```

**Output Explanation:**
```
 M file.txt          # Modified (unstaged)
M  file.txt          # Modified (staged)
A  newfile.txt       # New file (staged)
D  deleted.txt       # Deleted (staged)
?? untracked.txt     # Untracked file
```

### git diff - View Changes

| Command | Compare | Purpose | When to Use |
|---------|---------|---------|-------------|
| `git diff` | Working dir vs Staging | View unstaged changes | Review before commit |
| `git diff --staged` | Staging vs HEAD | View staged changes | Final check before commit |
| `git diff HEAD` | Working dir vs HEAD | View all uncommitted changes | Global review |
| `git diff <branch1> <branch2>` | Branch comparison | Compare branches | Preview before merge |
| `git diff <commit1> <commit2>` | Commit comparison | Compare commits | Review history changes |

**Useful Options:**
```bash
# Show only filenames
git diff --name-only

# Show stats
git diff --stat

# Show diff for specific file
git diff <file>

# Word-level diff (finer)
git diff --word-diff

# Show line add/remove stats
git diff --numstat
```

### git log - View History

| Option | Purpose | Scenario |
|--------|---------|----------|
| `git log --oneline` | One-line, concise | Quick history browse |
| `git log --graph --decorate` | Branch graph | Understand branch structure |
| `git log --all --graph --oneline` | Full branch graph | View all branch history |
| `git log -p` | Show diff per commit | Detailed review |
| `git log --stat` | Show file change stats | Understand change scope |
| `git log --author="name"` | Filter by author | View specific person's commits |
| `git log --since="2024-01-01"` | Filter by time | View commits in period |
| `git log --grep="pattern"` | Filter by message | Find related feature commits |
| `git log -S"string"` | Search code content | Track code introduction |

**Examples:**
```bash
# View last 10 commits with details
git log -10 -p

# View all commits for a feature
git log --grep="feat" --oneline

# View history for a file
git log -- file.txt

# View commits in main but not in develop
git log develop..main

# Who changed a file after a date
git log --since="2024-01-01" -- file.txt

# Custom output format
git log --pretty=format:"%h - %an, %ar : %s"
```

**Common Format Directives:**
```
%h    - Short commit hash
%an   - Author name
%ae   - Author email
%ad   - Author date
%ar   - Author date (relative)
%s    - Commit subject
%b    - Commit body
```

### git show - View Commit Details

```bash
# View details and changes for a commit
git show <commit>

# View file content in a commit
git show <commit>:<file>

# View commit stats
git show --stat <commit>
```

---

## Merging & Conflict Resolution

### git merge - Merge Branches

| Option | Result | When to Use |
|--------|--------|-------------|
| `git merge <branch>` | Create merge commit | Preserve branch history |
| `git merge --no-ff <branch>` | Force merge commit | Feature branch merge, keep record |
| `git merge --ff-only <branch>` | Only allow fast-forward | Keep linear history |
| `git merge --squash <branch>` | Squash to single commit | Clean up feature branch history |

**Merge Workflow:**
```bash
# Scenario 1: Merge feature branch, keep history
git checkout develop
git pull origin develop
git merge --no-ff feature/new-api
git push origin develop

# Scenario 2: Check for conflicts before merging
git merge --no-commit --no-ff feature/new-api
# Check status
git status
# Abort merge
git merge --abort

# Scenario 3: Squash multiple commits
git merge --squash feature/new-api
git commit -m "feat: add new API endpoint"
```

### git rebase - Rebase

**Use Case:** Keep linear history, avoid merge commits

| Purpose | Command | When to Use |
|---------|--------|-------------|
| Basic rebase | `git rebase <branch>` | Update branch to latest main |
| Interactive rebase | `git rebase -i HEAD~5` | Reorganize, squash commits |
| Continue/Abort | `git rebase --continue` | Continue after conflict |
| | `git rebase --abort` | Abort rebase |

**Rebase Workflow:**
```bash
# Scenario 1: Keep linear history
git fetch origin
git rebase origin/main
# If conflict, resolve then continue
git rebase --continue

# Scenario 2: Squash multiple commits (interactive)
git rebase -i HEAD~3
# In editor:
# p pick      - keep commit
# r reword    - keep, edit message
# s squash    - merge into previous
# f fixup     - merge, discard message
# e edit      - stop to edit
# d drop      - delete commit

# Scenario 3: Change author of earlier commit
git rebase -i <commit>^
# Change to e (edit)
git commit --amend --author="Name <email@example.com>"
git rebase --continue
```

**Merge vs Rebase Comparison:**

| Feature | Merge | Rebase |
|---------|-------|--------|
| History | Preserves branch info | Linear history |
| Safety | High (doesn't rewrite) | Use with care (rewrites history) |
| Readability | Branches clear | Simple, direct |
| Collaboration | Safe for shared branches | Only for local branches |
| Conflict Handling | Resolve once | Resolve per commit |

**Best Practices:**
```
- Local branches: use rebase for linear history
- Shared branches: use merge to preserve history
- Public releases: never rebase pushed commits
```

### Conflict Resolution

#### Identify Conflicts

```bash
# Conflict marker format
<<<<<<< HEAD
Your changes
=======
Other changes
>>>>>>> branch-name
```

#### Steps to Resolve Conflicts

```bash
# 1. View conflicted files
git status

# 2. Edit files, choose what to keep

# 3. Mark as resolved
git add <resolved-file>

# 4. For merge conflicts
git commit -m "Resolve merge conflicts"

# 5. For rebase conflicts
git rebase --continue
```

#### Conflict Resolution Strategies

```bash
# Keep current branch changes
git checkout --ours <file>

# Keep incoming branch changes
git checkout --theirs <file>

# After manual edit, mark as resolved
git add <file>

# Abort merge
git merge --abort

# Abort rebase
git rebase --abort
```

---

## Remote Collaboration

### git remote - Manage Remotes

| Command | Purpose |
|---------|---------|
| `git remote -v` | List all remotes and URLs |
| `git remote add <name> <url>` | Add remote |
| `git remote remove <name>` | Remove remote |
| `git remote rename <old> <new>` | Rename remote |
| `git remote set-url <name> <url>` | Change remote URL |
| `git remote show <name>` | Show remote details |

**Typical Multi-Remote Scenario:**
```bash
# Add upstream (for original project updates)
git remote add upstream https://github.com/original/repo.git

# Add your fork
git remote add origin https://github.com/myname/repo.git

# List all remotes
git remote -v

# Fetch latest from upstream
git fetch upstream
git rebase upstream/main

# Push to your fork
git push origin feature/my-changes
```

### git fetch - Get Updates

```bash
# Fetch all remote updates (no merge)
git fetch origin

# Fetch specific branch
git fetch origin main

# Fetch all remotes
git fetch --all

# Prune deleted remote branches
git fetch -p (--prune)
```

**fetch vs pull:**
```bash
# fetch: download only, no merge
git fetch origin
git log origin/main  # View remote branch

# pull: download and merge (default is merge)
git pull origin main

# pull with rebase: download and rebase
git pull --rebase origin main
```

### git pull - Get & Merge

| Option | Behavior |
|--------|---------|
| No option | Fetch and merge (creates merge commit) |
| `--rebase` | Fetch and rebase (linear history) |
| `--ff-only` | Only allow fast-forward, else fail |

**Best Practices:**
```bash
# Set global rebase instead of merge
git config --global pull.rebase true

# For specific repo
git config pull.rebase true

# Pull operation
git pull --rebase origin main
```

### git push - Push Updates

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `git push` | Push current branch | Branch has upstream tracking |
| `git push origin <branch>` | Push to specific remote | First push |
| `git push -u origin <branch>` | Push and set upstream | New branch push |
| `git push --force-with-lease` | Safe force push | After rebase (recommended) |
| `git push --force` | Force push | Overwrite remote history (dangerous) |
| `git push origin --all` | Push all branches | Backup all branches |
| `git push origin <branch> -d` | Delete remote branch | Clean up merged branches |

**Push Guidelines:**
```bash
# Scenario 1: First push of new branch
git push -u origin feature/new-api

# Scenario 2: Normal push
git push

# Scenario 3: After rebase, safe force push
git rebase origin/main
git push --force-with-lease

# Scenario 4: Delete remote branch
git push origin -d feature/old-feature

# Scenario 5: Push tag
git push origin v1.0.0
```

---

## Advanced Techniques

### git stash - Temporarily Save Changes

**Use Case:** Need to switch branches temporarily, don't want to commit current changes

| Command | Purpose |
|---------|---------|
| `git stash` | Save current changes |
| `git stash save "description"` | Save with description |
| `git stash list` | List all stashes |
| `git stash apply` | Apply stash, keep stash |
| `git stash pop` | Apply and remove stash |
| `git stash drop` | Delete stash |
| `git stash clear` | Clear all stashes |

**Workflow:**
```bash
# Scenario 1: Developing feature, need to fix urgent bug
git stash
git checkout -b hotfix/critical-bug main
# Fix bug and commit
git checkout feature/my-feature
git stash pop

# Scenario 2: Apply specific stash
git stash list
git stash apply stash@{2}

# Scenario 3: Convert stash to branch
git stash branch feature-from-stash
```

### git cherry-pick - Selectively Apply Commits

**Purpose:** Copy specific commits from one branch to another

```bash
# Basic usage
git cherry-pick <commit>

# Multiple commits
git cherry-pick <commit1> <commit2> <commit3>

# Commit range
git cherry-pick <commit1>..<commit2>  # Excludes commit1
git cherry-pick <commit1>^..<commit2> # Includes commit1

# Continue cherry-pick (if conflict)
git cherry-pick --continue

# Abort cherry-pick
git cherry-pick --abort
```

**Scenarios:**
```bash
# Scenario: Production needs a specific fix from feature branch
git checkout release/v1.0
git cherry-pick abc1234  # Specific commit hash

# Scenario: Select multiple related commits from develop
git checkout main
git cherry-pick develop~3..develop~1
```

**Cherry-pick vs Merge vs Rebase:**
```
Cherry-pick: Select specific commits, good for small integrations
Merge: Merge whole branch, keep branch relationship
Rebase: Change base, keep linear history
```

### git reset - Undo Commits

| Option | Effect | Use Case |
|--------|--------|----------|
| `--soft` | Undo commit, keep changes staged | Edit commit message or merge small changes |
| `--mixed` | Undo commit, keep changes in working dir | Selectively recommit changes |
| `--hard` | Undo commit and changes, full reset | Discard all changes, revert to commit |

**Workflow:**
```bash
# Scenario 1: Fix previous commit (only if not pushed)
git reset --soft HEAD~1
# Edit content
git add .
git commit -m "corrected message"

# Scenario 2: Undo commit, keep changes, recommit selectively
git reset --mixed HEAD~3
# Now selectively add and commit

# Scenario 3: Full reset to a commit, discard all changes
git reset --hard <commit>

# Scenario 4: Reset only one file
git reset --soft HEAD~1 file.txt
```

### git revert - Reverse Commit

**Difference from reset:** Doesn't change history, creates new reverse commit

```bash
# Create reverse commit, undo changes of commit
git revert <commit>

# Reverse multiple commits
git revert <commit1> <commit2>

# Range revert
git revert <commit1>..<commit2>

# Revert but don't commit (let user commit)
git revert --no-commit <commit>

# Abort revert
git revert --abort
```

**When to Use:**
```bash
# For pushed commits, use revert (safe)
git revert abc1234

# For local, not pushed commits, use reset
git reset --hard HEAD~1
```

### git bisect - Binary Search for Bugs

**Purpose:** Quickly find commit that introduced a bug

```bash
# Start bisect
git bisect start

# Mark current (bad) commit
git bisect bad

# Mark known good commit
git bisect good <commit>

# Git checks out middle commit, test then run
git bisect good  # If this version is good
# or
git bisect bad   # If this version is bad

# After finding bug commit, view details
git bisect log

# End bisect
git bisect reset
```

**Automate bisect:**
```bash
# Run script to automate bisect
git bisect start
git bisect bad HEAD
git bisect good v1.0
git bisect run ./test.sh  # test.sh returns 0 for good, non-0 for bad
git bisect reset
```

### git blame - Track Code Origin

**Purpose:** See who changed each line of a file and when

```bash
# Basic usage
git blame <file>

# Show email
git blame -e <file>

# Show line range
git blame -L 10,20 <file>

# Ignore whitespace
git blame -w <file>

# Show original commit (track refactor)
git blame -C <file>
```

**Output Explanation:**
```
abc1234 (Author Name 2024-01-15 10:30:45 +0800 10) var x = 1;

^commit^ ^author name^   ^date and time^           ^line#^ ^code^
```

### git tag - Mark Important Versions

```bash
# List all tags
git tag

# Create lightweight tag
git tag v1.0.0

# Create annotated tag (recommended)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Tag specific commit
git tag v1.0.0 <commit>

# Delete local tag
git tag -d v1.0.0

# Push tag to remote
git push origin v1.0.0

# Push all tags
git push origin --tags

# Delete remote tag
git push origin :v1.0.0
# or
git push origin --delete v1.0.0

# View tag info
git show v1.0.0
```

**Semantic Versioning:**
```
MAJOR.MINOR.PATCH (e.g., 1.2.3)

MAJOR: Breaking API changes
MINOR: Backward-compatible features
PATCH: Backward-compatible bug fixes

Example:
1.0.0 → 1.0.1 (bug fix)
1.0.0 → 1.1.0 (new feature)
1.0.0 → 2.0.0 (breaking change)
```

### git worktree - Parallel Work

**Purpose:** Work on multiple branches in same repo

```bash
# Create new worktree
git worktree add <path> <branch>

# Create worktree from new branch
git worktree add -b <new-branch> <path> <start-point>

# List all worktrees
git worktree list

# Remove worktree
git worktree remove <path>

# Prune broken worktrees
git worktree prune
```

**Workflow:**
```bash
# Scenario: Need to fix bug while developing feature
# Project structure: MyProject/
#                   ├── main/        (main branch)
#                   └── hotfix/      (new worktree)

# 1. Initial clone to main
mkdir MyProject && cd MyProject
git clone https://github.com/user/repo.git main

# 2. Create hotfix worktree
cd main
git worktree add ../hotfix main

# 3. Fix bug in hotfix
cd ../hotfix
git checkout -b hotfix/critical-bug
# Fix bug and commit

# 4. Switch back to main worktree for feature
git checkout main
# Continue feature development

# 5. After fix, remove worktree
git worktree remove ../hotfix
```

---

## Team Best Practices

### Commit Guidelines

**Commit Message Structure:**
```
<type>(<scope>): <subject> (max 50 chars)

<body> (max 72 chars per line, what/why)

<footer>
Closes #123
Reviewed-by: John Doe
```

**Checklist:**
- [ ] Proper commit granularity (logical unit)
- [ ] Clear, meaningful message
- [ ] Related tests added/updated
- [ ] Code passes linting
- [ ] Documentation updated

### Code Review Workflow

```bash
# 1. Create feature branch
git checkout -b feature/user-profile develop

# 2. Sync with develop regularly
git fetch origin
git rebase origin/develop

# 3. Before merge, ensure clean history
git rebase -i origin/develop
# Squash/clean up commits as needed

# 4. Push branch
git push -u origin feature/user-profile

# 5. Create Pull Request (via GitHub/GitLab UI)

# 6. Address review feedback
# Add new commit, don't rewrite history
git add .
git commit -m "Address review feedback"
git push

# 7. After approval, squash merge
git checkout develop
git pull origin develop
git merge --squash feature/user-profile
git commit -m "feat: add user profile page"
git push origin develop

# 8. Delete feature branch
git branch -d feature/user-profile
git push origin -d feature/user-profile
```

### Branch Protection Rules

**Configure in GitHub/GitLab:**
- Require pull request review
- Require CI/CD checks
- Disallow force push
- Require up-to-date branch
- Prevent branch deletion

### Git Submodules Management

Git submodules allow you to include and track external repositories within your main project while maintaining their version history independently. For comprehensive submodule management, workflows, and best practices, please refer to: [Complete Guide to Git Submodules](./git-submodule-guide-en.md)

### Git Hooks Automation

Git hooks are essential tools for automating code quality checks, testing, and standard enforcement. For detailed hooks configuration and usage guides, please refer to [Complete Guide to Git Hooks](./git-hooks-guide-en.md).

**Quick Start Example:**

**Use Husky to manage hooks (recommended):**
```bash
npm install husky --save-dev
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# Add commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit"
```

**Basic Pre-commit hook (`.git/hooks/pre-commit`):**
```bash
#!/bin/sh

# Run linter
eslint .
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix issues before committing."
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed. Please fix issues before committing."
    exit 1
fi

exit 0
```

**Hook Coverage:**
- Native Git hooks configuration
- Husky modern management
- Commitizen standardized commits
- Pre-commit framework integration
- Multi-language support (JavaScript/TypeScript, Python, C++)
- Advanced configurations and best practices

For detailed configuration examples and troubleshooting, please refer to the dedicated hooks guides mentioned above.

---

## Recovery & Debugging

### git reflog - Recover Lost Commits

**Purpose:** View HEAD history, recover deleted branches/commits

```bash
# View all HEAD changes
git reflog

# View reflog for branch
git reflog <branch>

# Recover deleted branch
git reflog
# Find commit hash to recover
git checkout -b recovered-branch <hash>

# Recover deleted commit
git reflog
git reset --hard <hash>
```

**Output Explanation:**
```
abc1234 HEAD@{0}: commit: Update documentation
def5678 HEAD@{1}: rebase -i: Pick
ghi9012 HEAD@{2}: checkout: moving from main to feature
...
```

### git clean - Clean Working Directory

```bash
# Preview files to be deleted (dry run)
git clean -n

# Delete untracked files
git clean -f

# Delete untracked files and directories
git clean -fd

# Delete ignored files
git clean -fX

# Delete all untracked content
git clean -fdX
```

### git fsck - Check Repo Integrity

```bash
# Check repository
git fsck

# Find dangling objects (possibly lost commits)
git fsck --lost-found

# Recover lost objects
git fsck --full
```

### .gitignore Best Practices

```
# Ignore node_modules
node_modules/

# Ignore environment config
.env
.env.local

# Ignore build output
dist/
build/

# Ignore IDE config
.vscode/
.idea/
*.swp

# Ignore system files
.DS_Store
Thumbs.db

# Ignore logs
*.log

# Use ! for exceptions
!.env.example
```

---

## Troubleshooting

### Common Issues & Solutions

**Issue 1: Push rejected (non-fast-forward)**
```bash
# Error: failed to push some refs to
# Reason: Remote has commits not in local

# Solution 1: Pull and rebase
git pull --rebase origin main
git push origin main

# Solution 2: Pull and merge
git pull origin main
git push origin main
```

**Issue 2: Commit to wrong branch**
```bash
# Scenario: Should commit to feature branch, actually committed to main

# 1. Get commit hash from main
git log  # Note latest commit hash

# 2. Undo commit on main
git reset --soft HEAD~1

# 3. Switch to correct branch
git checkout feature/correct-branch

# 4. Recommit
git commit -m "correct message"
```

**Issue 3: Need to edit pushed commit**
```bash
# Only for small changes, no collaborators
git commit --amend
git push --force-with-lease

# If collaborators, create reverse commit
git revert <commit>
git push
```

**Issue 4: Accidentally deleted local branch**
```bash
git reflog
# Find last commit of branch
git checkout -b recovered-branch <hash>
```

---

## Performance Optimization

### Large Repo Optimization

```bash
# Use shallow clone
git clone --depth 1 <url>

# Clone specific branch
git clone --single-branch -b main <url>

# Partial clone (download only needed files)
git clone --filter=blob:none <url>

# Deepen branch history
git fetch --deepen=10

# Periodically clean up
git gc --aggressive
```

### Quick Reference for Common Commands

```bash
# Daily work
git status              # View status
git add <file>          # Stage file
git commit -m "msg"     # Create commit
git push                # Push
git pull --rebase       # Pull

# Branch management
git checkout -b <name>  # Create branch
git branch -d <name>    # Delete branch
git merge --no-ff <br>  # Merge branch

# History changes
git reset --soft HEAD~1 # Undo commit
git revert <commit>     # Reverse commit
git cherry-pick <hash>  # Select commit

# Debugging
git log --oneline       # View history
git show <commit>       # View commit
git blame <file>        # Track code
git bisect start        # Binary search

# Recovery
git reflog              # View history
git checkout <hash>     # Checkout commit
git reset --hard <hash> # Hard reset
```

---

## Configuration & Optimization

### Important Git Configurations

```bash
# Set identity (required)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default editor
git config --global core.editor "vim"

# Use rebase as default pull strategy
git config --global pull.rebase true

# Configure quick aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'

# Enable color output
git config --global color.ui true

# Configure merge tool
git config --global merge.tool vimdiff

# View all configs
git config --list

# Edit global config file
git config --global --edit
```

### Efficient Git Aliases

```bash
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'
git config --global alias.amend 'commit --amend --no-edit'
git config --global alias.undo 'reset --soft HEAD~1'
git config --global alias.stash-all 'stash save --include-untracked'
```

---

## Summary & Recommendations

### Core Principles
1. **Frequent commits**: Small, logically related commits are easier to track and revert
2. **Clear commit messages**: Help the team understand change intent
3. **Regular sync**: Avoid long-lived branches and complex conflicts
4. **Protect the trunk**: Main branch should always be stable and releasable
5. **Use workflows**: Team follows consistent processes

### Branch Lifecycle Recommendations
- Feature branch: 1-5 days
- Release branch: 1-2 weeks
- Hotfix branch: Hours to 1 day
- Delete merged branches: Clean up regularly

### When to Use Each Command
| Scenario | Recommended Command |
|----------|--------------------|
| Daily update | `git pull --rebase` |
| Merge feature | `git merge --no-ff` |
| Clean up history | `git rebase -i` |
| Select commits | `git cherry-pick` |
| Urgent fix | `git worktree` + `git hotfix` |
| Track issues | `git bisect` + `git blame` |

---

## Resources & Advanced

### Official Docs
- Git Official Docs: https://git-scm.com/doc
- GitHub Docs: https://docs.github.com
- GitLab Docs: https://docs.gitlab.com

### Learning Resources
- "Pro Git" Book (Free Online)
- Git Visual Learning: https://learngitbranching.js.org/
- GitHub Skills: https://skills.github.com/
