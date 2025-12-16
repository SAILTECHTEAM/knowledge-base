# Complete Guide to Git Hooks

## Table of Contents
1. [Introduction to Git Hooks](#introduction-to-git-hooks)
2. [Native Git Hooks](#native-git-hooks)
3. [Husky - Modern Git Hooks Management](#husky---modern-git-hooks-management)
4. [Commitizen - Standardized Commit Messages](#commitizen---standardized-commit-messages)
5. [Pre-commit Framework](#pre-commit-framework)
6. [Environment-Specific Setup](#environment-specific-setup)
7. [Advanced Hook Configurations](#advanced-hook-configurations)
8. [Best Practices & Troubleshooting](#best-practices--troubleshooting)

---

## Introduction to Git Hooks

### What are Git Hooks?

Git hooks are scripts that Git automatically executes before or after events such as commit, push, or receive. They allow you to automate tasks, enforce standards, and customize Git behavior.

### Why Use Git Hooks?

| Benefit | Description | Example |
|---------|-------------|---------|
| **Code Quality** | Automatically run linters and formatters | Run ESLint before each commit |
| **Testing** | Ensure tests pass before commits | Run unit tests on pre-commit |
| **Security** | Prevent sensitive data from being committed | Check for secrets/API keys |
| **Consistency** | Enforce commit message standards | Validate conventional commits |
| **Automation** | Automate repetitive tasks | Update version numbers on tag |

### Hook Categories

| Category | Hooks | Purpose |
|----------|-------|---------|
| **Client-side** | pre-commit, commit-msg, pre-push | Local developer workflow |
| **Server-side** | pre-receive, post-receive, update | Repository management |
| **Email** | applypatch-msg, post-applypatch | Patch workflow |

---

## Native Git Hooks

### Hook Locations

```bash
# Local repository hooks
.git/hooks/

# Global hooks (applies to all repos)
~/.git/hooks/

# System-wide hooks
/etc/git/hooks/
```

### Available Client-Side Hooks

| Hook | When it Runs | Common Use Cases |
|------|--------------|------------------|
| `pre-commit` | Before typing commit message | Linting, formatting, basic validation |
| `prepare-commit-msg` | Before commit message editor opens | Default commit messages, templates |
| `commit-msg` | After commit message is saved | Validate commit message format |
| `post-commit` | After commit is created | Notifications, logging |
| `pre-push` | After push but before sending to remote | Run tests, check branch protection |
| `post-push` | After successful push | Notifications, deployment triggers |
| `pre-rebase` | Before rebase starts | Check if rebase is safe |
| `post-checkout` | After checkout | Setup environment, install dependencies |
| `post-merge` | After merge | Update dependencies, cleanup |

### Creating a Basic Pre-commit Hook

```bash
# Navigate to hooks directory
cd .git/hooks/

# Create pre-commit hook file
touch pre-commit
chmod +x pre-commit

# Edit the hook
nano pre-commit
```

**Example Pre-commit Hook:**
```bash
#!/bin/sh

# Exit on any error
set -e

echo "Running pre-commit checks..."

# Run ESLint for JavaScript/TypeScript files
if command -v eslint >/dev/null 2>&1; then
    eslint . --ext .js,.jsx,.ts,.tsx
    echo "✓ ESLint checks passed"
fi

# Run Python linting
if command -v flake8 >/dev/null 2>&1; then
    flake8 *.py
    echo "✓ Python linting passed"
fi

# Check for common security issues
if grep -r "password\|secret\|api_key\|token" --include="*.js" --include="*.py" --include="*.json" .; then
    echo "❌ Potential secrets found in code!"
    exit 1
fi

echo "✓ All pre-commit checks passed"
exit 0
```

### Commit Message Validation Hook

```bash
#!/bin/sh

# .git/hooks/commit-msg
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Expected format: <type>(<scope>): <subject>"
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    echo "Example: feat(auth): add JWT token validation"
    exit 1
fi

echo "✓ Commit message format is valid"
exit 0
```

### Pre-push Hook Example

```bash
#!/bin/sh

# .git/hooks/pre-push
echo "Running pre-push checks..."

# Run tests
if command -v npm >/dev/null 2>&1; then
    npm test
elif command -v pytest >/dev/null 2>&1; then
    pytest
fi

# Check if we're pushing to main/master
current_branch=$(git rev-parse --abbrev-ref HEAD)
protected_branches="main master develop"

if echo "$protected_branches" | grep -q "$current_branch"; then
    echo "⚠️  Pushing to protected branch: $current_branch"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Pre-push checks passed"
exit 0
```

---

## Husky - Modern Git Hooks Management

### Why Use Husky?

| Native Hooks | Husky |
|--------------|-------|
| Manual setup | Automated installation |
| Not version controlled | Shared with team |
| Platform-specific | Cross-platform |
| Hard to maintain | Easy to update |

### Installation

```bash
# Install Husky
npm install husky --save-dev

# Enable Git hooks
npx husky install

# Add prepare script to package.json
npm pkg set scripts.prepare="husky install"
```

### Basic Configuration

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

### Adding Hooks

```bash
# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint"

# Add commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit"

# Add pre-push hook
npx husky add .husky/pre-push "npm test"
```

### Husky Hook Examples

**.husky/pre-commit:**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint

# Run formatting check
npm run format -- --check

# Run type checking
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

# Run tests
npm run test:coverage

# Check build
npm run build
```

### Husky with Yarn

```bash
# Yarn 2+
yarn add husky --dev
yarn husky install

# Add hooks
yarn husky add .husky/pre-commit "yarn lint"
yarn husky add .husky/commit-msg "yarn commitlint --edit"
```

---

## Commitizen - Standardized Commit Messages

### What is Commitizen?

Commitizen helps you write standardized commit messages that follow the Conventional Commits specification.

### Installation

```bash
# Install Commitizen and conventional commits adapter
npm install commitizen cz-conventional-changelog --save-dev

# Configure package.json
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"
```

### Basic Usage

```bash
# Interactive commit
npm run commit

# Or use cz command
npx cz
```

### Commitizen Configuration

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
          "description": "A new feature",
          "title": "Features"
        },
        "fix": {
          "description": "A bug fix",
          "title": "Bug Fixes"
        },
        "docs": {
          "description": "Documentation only changes",
          "title": "Documentation"
        },
        "style": {
          "description": "Changes that do not affect the meaning of the code",
          "title": "Styles"
        },
        "refactor": {
          "description": "A code change that neither fixes a bug nor adds a feature",
          "title": "Code Refactoring"
        },
        "test": {
          "description": "Adding missing tests or correcting existing tests",
          "title": "Tests"
        },
        "chore": {
          "description": "Maintenance tasks",
          "title": "Chores"
        }
      }
    }
  }
}
```

### Commitlint Integration

```bash
# Install commitlint
npm install @commitlint/cli @commitlint/config-conventional --save-dev

# Create commitlint config
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
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Code style
        'refactor', // Refactoring
        'test',     // Tests
        'chore',    // Maintenance
        'perf',     // Performance
        'ci',       // CI configuration
        'build',    // Build system
        'revert'    // Revert changes
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
```

---

## Pre-commit Framework

### What is Pre-commit?

Pre-commit is a framework for managing and maintaining multi-language pre-commit hooks.

### Installation

```bash
# Install pre-commit
pip install pre-commit

# Create pre-commit config
touch .pre-commit-config.yaml
```

### Basic Configuration

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

### Installing Hooks

```bash
# Install hooks for current repository
pre-commit install

# Install hooks for all repositories
pre-commit install --install-hooks

# Run hooks manually on all files
pre-commit run --all-files

# Run specific hook
pre-commit run trailing-whitespace --all-files
```

### Language-Specific Hooks

#### Python Project Example

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

#### JavaScript/TypeScript Project Example

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

## Environment-Specific Setup

### Node.js/npm Environment

#### Complete Setup with Husky

```bash
# 1. Install dependencies
npm install husky commitizen @commitlint/cli @commitlint/config-conventional --save-dev

# 2. Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# 3. Configure commitizen
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"

# 4. Add hooks
npx husky add .husky/pre-commit "npm run lint && npm run test"
npx husky add .husky/commit-msg "npx commitlint --edit"

# 5. Create commitlint config
echo "module.exports = {extends: ['@commitlint/config-conventional']};" > commitlint.config.js
```

**package.json example:**
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

### Python Environment

#### Pre-commit Setup

```bash
# 1. Install pre-commit
pip install pre-commit

# 2. Create .pre-commit-config.yaml
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

# 3. Install hooks
pre-commit install
```

#### Native Git Hooks for Python

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running Python pre-commit checks..."

# Run black formatter check
if command -v black >/dev/null 2>&1; then
    black --check .
    echo "✓ Black formatting check passed"
fi

# Run isort import sorting check
if command -v isort >/dev/null 2>&1; then
    isort --check-only .
    echo "✓ Import sorting check passed"
fi

# Run flake8 linting
if command -v flake8 >/dev/null 2>&1; then
    flake8 .
    echo "✓ Flake8 linting passed"
fi

# Run mypy type checking
if command -v mypy >/dev/null 2>&1; then
    mypy .
    echo "✓ MyPy type checking passed"
fi

# Run tests
if command -v pytest >/dev/null 2>&1; then
    pytest
    echo "✓ Tests passed"
fi

echo "✓ All pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit
```

### C++ Environment

#### Pre-commit Configuration

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

#### Native Git Hooks for C++

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "Running C++ pre-commit checks..."

# Run clang-format
if command -v clang-format >/dev/null 2>&1; then
    find . -name "*.cpp" -o -name "*.h" -o -name "*.hpp" | xargs clang-format -i
    echo "✓ Code formatted with clang-format"
fi

# Run cppcheck
if command -v cppcheck >/dev/null 2>&1; then
    cppcheck --enable=all --suppress=missingIncludeSystem --error-exitcode=1 .
    echo "✓ Static analysis passed"
fi

# Build project
if [ -f "CMakeLists.txt" ]; then
    mkdir -p build
    cd build
    cmake ..
    make
    cd ..
    echo "✓ Build successful"
fi

# Run tests
if [ -f "build/tests" ]; then
    ./build/tests
    echo "✓ Tests passed"
fi

echo "✓ All pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit
```

---

## Advanced Hook Configurations

### Multi-Stage Validation Pipeline

```bash
#!/bin/bash
# .husky/pre-commit

set -e

echo "🚀 Starting pre-commit validation pipeline..."

# Stage 1: Quick checks (fail fast)
echo "📋 Stage 1: Quick validation checks"
npm run lint:fix || {
    echo "❌ Linting failed"
    exit 1
}

# Stage 2: Type checking
echo "🔍 Stage 2: Type checking"
npm run type-check || {
    echo "❌ Type checking failed"
    exit 1
}

# Stage 3: Unit tests
echo "🧪 Stage 3: Running unit tests"
npm run test:unit || {
    echo "❌ Unit tests failed"
    exit 1
}

# Stage 4: Build verification
echo "🏗️  Stage 4: Build verification"
npm run build || {
    echo "❌ Build failed"
    exit 1
}

# Stage 5: Security scan
echo "🔒 Stage 5: Security scan"
npm audit --audit-level moderate || {
    echo "⚠️  Security vulnerabilities found"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo "✅ All validation stages passed!"
```

### Conditional Hooks

```bash
#!/bin/bash
# .husky/pre-push

set -e

# Get current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Different checks for different branches
case $current_branch in
    "main"|"master")
        echo "🔒 Pushing to main branch - running full suite"
        npm run test:integration
        npm run test:e2e
        ;;
    "develop")
        echo "🚀 Pushing to develop branch - running standard tests"
        npm run test:unit
        npm run test:integration
        ;;
    *)
        echo "🔧 Feature branch - running basic checks"
        npm run test:unit
        ;;
esac

# Check if package.json changed
if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
    echo "📦 package.json changed - running npm audit"
    npm audit --audit-level moderate
fi

echo "✅ Pre-push checks completed"
```

### Custom Hook Utilities

```bash
#!/bin/bash
# scripts/git-hooks-utils.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Utility functions
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"
    
    log_info "Running: $description"
    if eval "$cmd"; then
        log_info "✓ $description completed successfully"
        return 0
    else
        log_error "✗ $description failed"
        return 1
    fi
}

# Check for changed files of specific type
check_changed_files() {
    local extension="$1"
    git diff --cached --name-only | grep -q "\.$extension$"
}

# Example usage in pre-commit hook
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

## Best Practices & Troubleshooting

### Best Practices

| Practice | Description | Implementation |
|----------|-------------|----------------|
| **Version Control** | Keep hooks in repository | Use Husky or pre-commit |
| **Fail Fast** | Run quick checks first | Order hooks by execution time |
| **Clear Messages** | Provide helpful error messages | Use colored output and specific guidance |
| **Performance** | Don't block developers unnecessarily | Cache results, run only relevant checks |
| **Documentation** | Document hook purposes | Comment hooks, maintain README |

### Hook Performance Optimization

```bash
#!/bin/bash
# Optimized pre-commit hook

# Only run checks on staged files
STAGED_JS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.js$')
STAGED_PY=$(git diff --cached --name-only --diff-filter=ACM | grep '\.py$')

# Run JavaScript checks only if JS files are staged
if [ -n "$STAGED_JS" ]; then
    echo "📝 Running JavaScript checks..."
    echo "$STAGED_JS" | xargs eslint
fi

# Run Python checks only if Python files are staged
if [ -n "$STAGED_PY" ]; then
    echo "🐍 Running Python checks..."
    echo "$STAGED_PY" | xargs flake8
fi
```

### Common Issues & Solutions

#### Issue 1: Hooks Not Executing

```bash
# Check if hooks are executable
ls -la .git/hooks/

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg

# For Husky, check installation
npx husky install
```

#### Issue 2: Hook Permissions

```bash
# Fix hook permissions
find .git/hooks -type f -name "*" -exec chmod +x {} \;

# For pre-commit framework
pre-commit install --install-hooks
```

#### Issue 3: Hook Timeout

```bash
# Add timeout to hooks
#!/bin/bash
timeout 300 npm test  # 5 minute timeout
if [ $? -eq 124 ]; then
    echo "❌ Tests timed out after 5 minutes"
    exit 1
fi
```

#### Issue 4: Skipping Hooks

```bash
# Skip hooks (use carefully)
git commit --no-verify
git push --no-verify

# Better approach: bypass specific checks
SKIP_LINT=true git commit
```

### Debugging Hooks

```bash
# Enable debug mode
export HUSKY_DEBUG=1
git commit

# Test hooks manually
./.git/hooks/pre-commit

# For pre-commit framework
pre-commit run --all-files --verbose
```

### Team Collaboration

#### Sharing Hooks with Team

```bash
# 1. Add to package.json (Husky)
{
  "scripts": {
    "postinstall": "husky install"
  }
}

# 2. Add to .pre-commit-config.yaml (pre-commit)
# File is automatically version controlled

# 3. Document in README
echo "## Development Setup

1. Clone repository
2. Install dependencies: npm install
3. Install hooks: npm run prepare
4. Verify: pre-commit run --all-files" >> README.md
```

#### Gradual Adoption

```bash
# Start with basic hooks
npx husky add .husky/pre-commit "npm run lint"

# Gradually add more checks
npx husky add .husky/pre-commit "npm run lint && npm run test"

# Add commit message validation
npx husky add .husky/commit-msg "npx commitlint --edit"
```

---

## Complete Example Projects

### Node.js Project Setup

```bash
#!/bin/bash
# setup-hooks.sh

echo "🚀 Setting up Git hooks for Node.js project..."

# Install dependencies
npm install --save-dev \
    husky \
    @commitlint/cli \
    @commitlint/config-conventional \
    commitizen \
    cz-conventional-changelog \
    eslint \
    prettier \
    jest

# Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Configure commitizen
npm pkg set scripts.commit="git-cz"
npm pkg set config.commitizen.path="cz-conventional-changelog"

# Add hooks
npx husky add .husky/pre-commit "npm run lint:fix && npm run test"
npx husky add .husky/commit-msg "npx commitlint --edit"

# Create commitlint config
cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [2, 'always', 72]
  }
};
EOF

echo "✅ Git hooks setup complete!"
```

### Python Project Setup

```bash
#!/bin/bash
# setup-python-hooks.sh

echo "🐍 Setting up Git hooks for Python project..."

# Install pre-commit
pip install pre-commit

# Create pre-commit config
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

# Install hooks
pre-commit install

echo "✅ Python Git hooks setup complete!"
```

---

## Resources & Further Reading

### Official Documentation
- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitizen Documentation](https://commitizen-tools.github.io/commitizen/)
- [Pre-commit Framework](https://pre-commit.com/)

### Configuration Examples
- [Awesome Git Hooks](https://github.com/AGhost-7/awesome-git-hooks)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint Configurations](https://eslint.org/docs/user-guide/configuring)

### Tools & Integrations
- [Commitlint](https://commitlint.js.org/)
- [Lint-staged](https://github.com/okonet/lint-staged)
- [Semantic Release](https://semantic-release.gitbook.io/)

---

*Last updated: December 2025*