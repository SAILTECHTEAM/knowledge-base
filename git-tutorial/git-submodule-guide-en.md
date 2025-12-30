# Complete Guide to Git Submodules

## Table of Contents
1. [Introduction to Git Submodules](#introduction-to-git-submodules)
2. [Basic Submodule Operations](#basic-submodule-operations)
3. [Advanced Submodule Management](#advanced-submodule-management)
4. [Workflow Strategies](#workflow-strategies)
5. [Collaboration with Submodules](#collaboration-with-submodules)
6. [Troubleshooting & Best Practices](#troubleshooting--best-practices)
7. [Alternative Solutions](#alternative-solutions)
8. [Real-World Examples](#real-world-examples)

---

## Introduction to Git Submodules

### What are Git Submodules?

Git submodules allow you to keep a Git repository as a subdirectory of another Git repository. This enables you to include and track external repositories within your main project while maintaining their version history independently.

### Why Use Submodules?

| Use Case | Description | Example |
|---------|-------------|---------|
| **Library Dependencies** | Include third-party libraries with specific versions | Vendor a UI framework or utility library |
| **Component Reuse** | Share common components across multiple projects | Shared authentication module |
| **Documentation** | Include external documentation repositories | API docs from another repo |
| **Microservices** | Organize related services in a monorepo structure | Multiple services in one project |
| **Plugin Systems** | Manage plugins as separate repositories | WordPress plugins, VS Code extensions |

### Submodule vs Other Solutions

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Submodules** | Version control, independent history, selective updates | Complex workflow, manual updates | External dependencies with specific versions |
| **Git subtree** | Simple history, single repo | Large repo size, no independent updates | Internal components, tight integration |
| **Package managers** | Automatic updates, dependency resolution | No source control, build artifacts | Language-specific dependencies |
| **Monorepo tools** | Advanced features, automation | Complex setup, learning curve | Large organizations, many projects |

---

## Basic Submodule Operations

### Adding a Submodule

| Command | Option | Purpose | When to Use |
|--------|--------|---------|-------------|
| `git submodule add <url>` | - | Add submodule at default path | Basic submodule addition |
| `git submodule add <url> <path>` | - | Add submodule at specific path | Custom directory structure |
| `git submodule add -b <branch> <url>` | - | Track specific branch | Track development branch |
| `git submodule add --depth 1 <url>` | - | Shallow clone submodule | Large submodules, faster setup |

**Basic Usage:**
```bash
# Add a submodule at default path (repository name)
git submodule add https://github.com/user/library.git

# Add submodule to specific directory
git submodule add https://github.com/user/library.git libs/library

# Add submodule tracking specific branch
git submodule add -b main https://github.com/user/library.git

# Add with shallow clone (faster, less history)
git submodule add --depth 1 https://github.com/user/library.git
```

### Cloning a Repository with Submodules

| Command | Option | Purpose | When to Use |
|--------|--------|---------|-------------|
| `git clone --recurse-submodules <url>` | - | Clone with all submodules | Initial project setup |
| `git clone <url> && git submodule update --init --recursive` | - | Manual two-step clone | Custom submodule setup |
| `git clone --depth 1 --recurse-submodules <url>` | - | Shallow clone with submodules | Large projects, quick setup |

**Cloning Workflows:**
```bash
# Method 1: One-step clone with submodules
git clone --recurse-submodules https://github.com/user/project.git
cd project

# Method 2: Two-step clone (more control)
git clone https://github.com/user/project.git
cd project
git submodule update --init --recursive

# Method 3: Shallow clone with submodules
git clone --depth 1 --recurse-submodules https://github.com/user/project.git
```

### Updating Submodules

| Command | Option | Purpose | When to Use |
|--------|--------|---------|-------------|
| `git submodule update` | - | Update to recorded commit | Sync with main repo |
| `git submodule update --remote` | - | Update to remote HEAD | Track upstream changes |
| `git submodule update --init` | - | Initialize and update | First-time setup |
| `git submodule update --recursive` | - | Update nested submodules | Complex submodule structures |

**Update Scenarios:**
```bash
# Scenario 1: Update all submodules to recorded commits
git submodule update --init --recursive

# Scenario 2: Update specific submodule to latest
git submodule update --remote libs/library

# Scenario 3: Pull latest main repo and update submodules
git pull
git submodule update --init --recursive

# Scenario 4: Update all submodules to their remote HEADs
git submodule update --remote --recursive
```

### Status and Information

| Command | Purpose | Output Information |
|--------|---------|-------------------|
| `git submodule status` | Show submodule status | Commit hash, branch, dirty state |
| `git submodule summary` | Show changes since last update | Commit differences |
| `git submodule foreach` | Run command in each submodule | Command execution results |
| `git ls-files --stage` | Show submodule entries | Git index information |

**Status Examples:**
```bash
# Check submodule status
git submodule status
# Output:
#  abc1234 libs/library (heads/main)
# + def5678 docs/api (1 ahead)

# Show detailed summary
git submodule summary
# Output:
# * libs/library abc1234...def5678 (2):
#   > Add new feature
#   > Fix bug

# Run command in all submodules
git submodule foreach 'git status'

# Check if submodules are clean
git submodule foreach 'git diff --exit-code'
```

---

## Advanced Submodule Management

### Working Inside Submodules

| Command | Purpose | When to Use |
|--------|---------|-------------|
| `cd <submodule-path>` | Enter submodule directory | Make changes to submodule |
| `git checkout <branch>` | Switch submodule branch | Work on different version |
| `git pull` | Update submodule | Get latest changes |
| `git commit` | Commit submodule changes | Update submodule pointer |

**Submodule Development Workflow:**
```bash
# 1. Enter submodule directory
cd libs/library

# 2. Make changes to submodule
git checkout -b feature/new-feature
# ... make changes ...
git add .
git commit -m "feat: add new feature"

# 3. Update submodule pointer in main repo
cd ..
git add libs/library
git commit -m "update: library to latest version"

# 4. Push both submodule and main repo
cd libs/library
git push origin feature/new-feature
cd ..
git push origin main
```

### Synchronizing Submodules

| Command | Option | Purpose | When to Use |
|--------|--------|---------|-------------|
| `git submodule sync` | - | Update remote URLs | Changed submodule URLs |
| `git submodule sync --recursive` | - | Sync nested submodules | Complex structures |
| `git submodule deinit` | - | Remove submodule configuration | Clean up unused submodules |

**Synchronization Examples:**
```bash
# Sync submodule URLs after remote changes
git submodule sync

# Sync and update all submodules
git submodule sync --recursive
git submodule update --init --recursive

# Remove submodule completely
git submodule deinit libs/library
git rm libs/library
rm -rf .git/modules/libs/library
```

### Branch Management with Submodules

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Fixed Commit** | Submodule points to specific commit | Stable releases |
| **Branch Tracking** | Submodule tracks branch | Development environments |
| **Tag-based** | Submodule points to tagged release | Version control |

**Branch Management Examples:**
```bash
# Strategy 1: Fixed commit (default)
git submodule add https://github.com/user/library.git
# Submodule points to specific commit hash

# Strategy 2: Branch tracking
git submodule add -b develop https://github.com/user/library.git
git config -f .gitmodules submodule.libs/library.branch develop
git add .gitmodules
git commit -m "track develop branch for library"

# Strategy 3: Update to specific tag
cd libs/library
git checkout v2.0.0
cd ..
git add libs/library
git commit -m "update: library to v2.0.0"
```

### Nested Submodules

| Command | Purpose | When to Use |
|--------|---------|-------------|
| `git submodule update --init --recursive` | Initialize nested submodules | Complex dependencies |
| `git submodule foreach --recursive` | Run command recursively | Batch operations |
| `git submodule status --recursive` | Show nested status | Deep inspection |

**Nested Submodule Workflow:**
```bash
# Clone with nested submodules
git clone --recurse-submodules https://github.com/user/project.git

# Update nested submodules
git submodule update --init --recursive

# Check status of all nested submodules
git submodule status --recursive

# Run command in all nested submodules
git submodule foreach --recursive 'git log --oneline -1'
```

---

## Workflow Strategies

### Development Workflow

#### Scenario 1: External Library Management

```bash
# 1. Add external library as submodule
git submodule add https://github.com/third-party/library.git vendor/library

# 2. Lock to specific version
cd vendor/library
git checkout v1.2.3
cd ..
git add vendor/library
git commit -m "vendor: lock library to v1.2.3"

# 3. Update to new version when needed
cd vendor/library
git fetch
git checkout v1.3.0
cd ..
git add vendor/library
git commit -m "vendor: update library to v1.3.0"
```

#### Scenario 2: Shared Component Development

```bash
# 1. Create shared component as separate repo
git clone https://github.com/company/shared-components.git
cd shared-components
# ... develop component ...
git push

# 2. Add as submodule to multiple projects
cd project-a
git submodule add https://github.com/company/shared-components.git components/shared
git commit -m "feat: add shared components submodule"

cd ../project-b
git submodule add https://github.com/company/shared-components.git components/shared
git commit -m "feat: add shared components submodule"

# 3. Update all projects when shared component changes
cd project-a
cd components/shared
git pull
cd ../..
git add components/shared
git commit -m "update: shared components to latest"
```

#### Scenario 3: Documentation Integration

```bash
# 1. Add documentation submodule
git submodule add https://github.com/project/docs.git docs

# 2. Configure to track main branch
git config -f .gitmodules submodule.docs.branch main
git add .gitmodules
git commit -m "docs: track main branch for documentation"

# 3. Update documentation automatically
git submodule update --remote docs
git add docs
git commit -m "docs: sync with latest documentation"
```

### Release Management

#### Version Pinning Strategy

```bash
# 1. Create release branch
git checkout -b release/v2.0.0

# 2. Pin all submodules to specific versions
git submodule foreach 'git checkout $(git describe --tags --abbrev=0)'

# 3. Commit pinned versions
git add .
git commit -m "release: pin all submodules for v2.0.0"

# 4. Create tag
git tag -a v2.0.0 -m "Release version 2.0.0"
git push origin v2.0.0
```

#### Automated Updates

```bash
#!/bin/bash
# scripts/update-submodules.sh

echo "Updating all submodules..."

# Update each submodule to latest
git submodule foreach '
    echo "Updating $name..."
    git fetch origin
    git checkout origin/$(git config --get submodule.$name.branch || echo main)
'

# Commit updates
git add .
git commit -m "chore: update all submodules to latest"

echo "Submodule updates complete!"
```

---

## Collaboration with Submodules

### Team Onboarding

#### New Developer Setup

```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "Setting up development environment..."

# Clone main repository
git clone https://github.com/company/project.git
cd project

# Initialize and update all submodules
git submodule update --init --recursive

# Install dependencies if needed
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

#### Submodule Contribution Workflow

```bash
# 1. Make changes to submodule
cd libs/shared-component
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 2. Create PR for submodule changes
# (via GitHub/GitLab UI)

# 3. After submodule PR is merged, update main repo
cd ../..
cd libs/shared-component
git checkout main
git pull
cd ..
git add libs/shared-component
git commit -m "update: shared-component to latest"
git push origin main
```

### CI/CD Integration

#### GitHub Actions Example

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

#### GitLab CI Example

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

## Troubleshooting & Best Practices

### Common Issues & Solutions

#### Issue 1: Submodule in Detached HEAD State

```bash
# Problem: Submodule is in detached HEAD
cd libs/library
git status
# Output: HEAD detached at abc1234

# Solution: Checkout proper branch
git checkout main
# or
git checkout -b feature-branch origin/feature-branch

# Update main repo to track branch
cd ..
git config -f .gitmodules submodule.libs/library.branch main
git add .gitmodules
git commit -m "fix: track main branch for library submodule"
```

#### Issue 2: Submodule Not Initialized

```bash
# Problem: Submodule directory exists but not initialized
git submodule status
# Output: -abc1234 libs/library

# Solution: Initialize submodule
git submodule init libs/library
git submodule update libs/library

# Or initialize all
git submodule update --init --recursive
```

#### Issue 3: Submodule URL Changed

```bash
# Problem: Submodule remote URL changed
cd libs/library
git remote -v
# Old URL still showing

# Solution: Update submodule URL
git config -f .gitmodules submodule.libs.library.url https://new-url.com/library.git
git submodule sync libs/library
git add .gitmodules
git commit -m "fix: update library submodule URL"
```

#### Issue 4: Merge Conflicts in Submodules

```bash
# Problem: Merge conflict in submodule pointer
git merge feature-branch
# Output: CONFLICT (content): Merge conflict in libs/library

# Solution: Choose correct submodule version
git checkout --ours libs/library  # Keep your version
# or
git checkout --theirs libs/library  # Take incoming version

# Resolve and commit
git add libs/library
git commit -m "resolve: submodule merge conflict"
```

### Best Practices

#### Repository Organization

```bash
# Recommended directory structure
project/
├── .gitmodules
├── src/
├── vendor/           # Third-party libraries
│   ├── library1/
│   └── library2/
├── components/       # Shared components
│   └── ui-components/
├── docs/            # Documentation
│   └── api-docs/
└── tools/           # Build tools
    └── build-scripts/
```

#### Submodule Configuration

```bash
# .gitmodules best practices
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

#### Commit Message Conventions

```bash
# Submodule-related commit messages
git commit -m "vendor: add lodash library as submodule"
git commit -m "update: shared-components to v2.1.0"
git commit -m "fix: pin library to stable version"
git commit -m "docs: sync with latest documentation"
git commit -m "chore: update all submodules to latest"
```

#### Performance Optimization

```bash
# Use shallow clones for large submodules
git submodule add --depth 1 https://github.com/large/library.git

# Sparse checkout for large submodules
cd vendor/library
git config core.sparsecheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -mu HEAD

# Update only changed submodules
git submodule update $(git diff --name-only HEAD~1 HEAD | grep -E '^[^/]+/' | sort -u)
```

### Security Considerations

#### Submodule Verification

```bash
#!/bin/bash
# scripts/verify-submodules.sh

echo "Verifying submodule integrity..."

# Check for unexpected changes
git submodule foreach '
    if [ -n "$(git status --porcelain)" ]; then
        echo "Warning: $name has uncommitted changes"
    fi
'

# Verify submodule URLs are HTTPS
git config --get-regexp '^submodule\..*\.url$' | while read line; do
    url=$(echo $line | cut -d' ' -f2)
    if [[ ! $url =~ ^https:// ]]; then
        echo "Warning: Insecure URL: $url"
    fi
done

echo "Verification complete."
```

#### Access Control

```bash
# Restrict submodule updates in CI
#!/bin/bash
# ci-scripts/submodule-check.sh

# Only allow updates from specific repositories
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

## Alternative Solutions

### Git Subtree

| Feature | Submodule | Subtree |
|---------|-----------|---------|
| Repository Size | Small pointers | Full history included |
| Workflow Complexity | Complex | Simple |
| Independent Updates | Yes | No |
| History Preservation | Separate | Combined |
| Learning Curve | Steep | Gentle |

**When to Use Subtree:**
```bash
# Add subtree
git subtree add --prefix=vendor/library https://github.com/user/library.git main --squash

# Update subtree
git subtree pull --prefix=vendor/library https://github.com/user/library.git main --squash

# Push changes back
git subtree push --prefix=vendor/library https://github.com/user/library.git main
```

### Package Managers

| Language | Package Manager | When to Use |
|----------|----------------|-------------|
| JavaScript | npm, yarn | Node.js dependencies |
| Python | pip, conda | Python libraries |
| Ruby | bundler | Ruby gems |
| Java | Maven, Gradle | Java dependencies |
| Go | go modules | Go packages |

**Example: npm vs Submodule**
```bash
# npm approach
npm install lodash@4.17.21

# Submodule approach
git submodule add https://github.com/lodash/lodash.git vendor/lodash
cd vendor/lodash
git checkout 4.17.21
```

### Monorepo Tools

| Tool | Features | Best For |
|------|----------|----------|
| Lerna | Multi-package management | JavaScript monorepos |
| Nx | Advanced caching, affected projects | Large organizations |
| Bazel | Build system, dependency analysis | Complex builds |
| Turborepo | Fast builds, caching | Performance-critical projects |

---

## Real-World Examples

### Example 1: WordPress Plugin Development

```bash
# Project structure
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

# Setup
git submodule add https://github.com/contact-form-7/contact-form-7.git wp-content/plugins/vendor/contact-form-7
git submodule add https://github.com/yoast/wordpress-seo.git wp-content/plugins/vendor/seo-plugin

# Update workflow
git submodule foreach -- wp-content/plugins/vendor/ '
    git fetch
    git checkout $(git describe --tags --abbrev=0)
'
git add .
git commit -m "update: plugins to latest stable versions"
```

### Example 2: Microservices Documentation

```bash
# Project structure
microservices-docs/
├── .gitmodules
├── mkdocs.yml
├── docs/
│   ├── api/
│   │   ├── user-service/
│   │   ├── order-service/
│   │   └── payment-service/
│   └── guides/

# Setup
git submodule add https://github.com/company/user-service.git docs/api/user-service
git submodule add https://github.com/company/order-service.git docs/api/order-service
git submodule add https://github.com/company/payment-service.git docs/api/payment-service

# Automated update script
#!/bin/bash
# scripts/update-api-docs.sh

for service in user-service order-service payment-service; do
    echo "Updating $service documentation..."
    cd docs/api/$service
    git pull origin main
    cd ../../..
done

# Build documentation
mkdocs build
git add docs/
git commit -m "docs: update API documentation"
```

### Example 3: Hardware Firmware Project

```bash
# Project structure
firmware-project/
├── .gitmodules
├── src/
├── lib/
│   ├── hal/          # Hardware abstraction layer
│   ├── drivers/      # Device drivers
│   └── protocols/    # Communication protocols
└── tools/
    ├── build-scripts/
    └── flash-tools/

# Setup with specific branches
git submodule add -b stable https://github.com/chip-vendor/hal.git lib/hal
git submodule add -b main https://github.com/company/drivers.git lib/drivers
git submodule add -b v1.0 https://github.com/standards/protocols.git lib/protocols

# Version-specific builds
#!/bin/bash
# scripts/build-version.sh

VERSION=$1
echo "Building firmware version $VERSION..."

# Update submodules to specific versions
git checkout $VERSION
git submodule update --init --recursive

# Build
make clean
make all

# Package
tar -czf firmware-$VERSION.tar.gz bin/
```

### Example 4: Educational Course Platform

```bash
# Project structure
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

# Setup
git submodule add https://github.com/edu/python-basics.git courses/python-basics
git submodule add https://github.com/edu/web-development.git courses/web-development
git submodule add https://github.com/edu/data-science.git courses/data-science

# Semester update workflow
#!/bin/bash
# scripts/update-semester.sh

SEMESTER=$1
echo "Updating courses for $SEMESTER..."

# Update all course content
git submodule foreach '
    echo "Updating $name..."
    git fetch origin
    git checkout origin/$SEMESTER || origin/main
'

# Update shared resources
cd shared/exercises
git pull origin main
cd ../solutions
git pull origin main
cd ../..

# Commit updates
git add .
git commit -m "update: course content for $SEMESTER"
git tag -a $SEMESTER -m "Course content for $SEMESTER"
```

---

## Performance & Optimization

### Large Repository Handling

```bash
# Partial clone with submodules
git clone --filter=blob:none --recurse-submodules https://github.com/large/project.git

# Sparse checkout with submodules
git config core.sparsecheckout true
echo "src/" > .git/info/sparse-checkout
git read-tree -mu HEAD

# Update only specific submodules
git submodule update vendor/library1 vendor/library2
```

### Caching Strategies

```bash
# Git configuration for submodule performance
git config --global submodule.fetchJobs 4  # Parallel fetch
git config --global status.submoduleSummary true  # Show summary

# Script for efficient updates
#!/bin/bash
# scripts/smart-update.sh

# Only update submodules that have changed
CHANGED=$(git diff --name-only HEAD~1 HEAD | grep -E '^[^/]+/' | sort -u)

if [ -n "$CHANGED" ]; then
    echo "Updating changed submodules: $CHANGED"
    git submodule update --init $CHANGED
else
    echo "No submodule changes detected"
fi
```

---

## Migration Guide

### From Subtree to Submodule

```bash
#!/bin/bash
# scripts/migrate-to-submodule.sh

SUBMODULE_NAME="library"
SUBMODULE_URL="https://github.com/user/library.git"

# 1. Remove subtree
git rm -r vendor/$SUBMODULE_NAME
git commit -m "remove: $SUBMODULE_NAME subtree"

# 2. Add as submodule
git submodule add $SUBMODULE_URL vendor/$SUBMODULE_NAME
git commit -m "add: $SUBMODULE_NAME as submodule"

# 3. Clean up
rm -rf .git/modules/vendor/$SUBMODULE_NAME
git submodule update --init --recursive
```

### From Vendor Directory to Submodule

```bash
#!/bin/bash
# scripts/vendor-to-submodule.sh

VENDOR_DIR="vendor/library"
SUBMODULE_URL="https://github.com/user/library.git"

# 1. Backup current vendor directory
cp -r $VENDOR_DIR ${VENDOR_DIR}.backup

# 2. Remove from git
git rm -r $VENDOR_DIR

# 3. Add as submodule
git submodule add $SUBMODULE_URL $VENDOR_DIR

# 4. Compare and merge changes if needed
# (manual process)

# 5. Clean up backup
rm -rf ${VENDOR_DIR}.backup
```

---

## Resources & Further Reading

### Official Documentation
- [Git Submodules Documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Pro Git Book - Submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

### Tools & Utilities
- [git-submodule-tools](https://github.com/ingydotnet/git-submodule-tools)
- [mr - Multiple Repository management](https://myrepos.branchable.com/)
- [repo - Android's multi-repo tool](https://source.android.com/setup/develop/repo)

### Best Practice Guides
- [Atlassian Git Submodules Tutorial](https://www.atlassian.com/git/tutorials/git-submodules)
- [GitHub Submodules Guide](https://docs.github.com/en/repositories/working-with-submodules)

### Advanced Topics
- [Git Submodule Design](https://github.com/git/git/blob/master/Documentation/technical/submodule-design.txt)
- [Large File Storage with Git LFS](https://git-lfs.github.com/)

---

*Last updated: December 2025*