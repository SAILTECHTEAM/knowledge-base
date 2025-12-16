# Complete Guide to uv: Modern Python Package Management

## Table of Contents
1. [What is uv](#what-is-uv)
2. [Why Suggest to Use uv](#why-suggest-to-use-uv)
3. [How to Use uv to Replace pip](#how-to-use-uv-to-replace-pip)
4. [Modern Usage and Best Practices](#modern-usage-and-best-practices)

---

## What is uv

### Overview

uv is an extremely fast Python package and project manager, written in Rust. It provides a unified interface for managing Python dependencies, virtual environments, Python versions, and projects.

### Core Architecture

| Component | Language | Purpose | Replaces |
|------------|----------|---------|-----------|
| **Package Installer** | Rust | Fast dependency resolution and installation | `pip` |
| **Project Manager** | Rust | Modern project management with lockfiles | `poetry`, `pip-tools` |
| **Environment Manager** | Rust | Virtual environment creation and management | `virtualenv`, `venv` |
| **Python Version Manager** | Rust | Install and switch Python versions | `pyenv` |
| **Tool Runner** | Rust | Execute CLI tools from packages | `pipx` |
| **Package Publisher** | Rust | Build and publish distributions | `twine` |

### Key Features

- **🚀 Unified Toolchain**: Single command replacing 8+ Python tools
- **⚡️ Performance**: 10-100x faster than pip (benchmarked)
- **🗂️ Project Management**: Universal lockfile support across platforms
- **❇️ Script Support**: Run scripts with inline dependency metadata
- **🐍 Python Management**: Install and manage multiple Python versions
- **🛠️ Tool Execution**: Run and install Python CLI tools
- **🔩 pip Compatibility**: Drop-in replacement for pip workflows
- **🏢 Workspaces**: Cargo-style multi-package projects
- **💾 Global Cache**: Disk-space efficient dependency deduplication

### Design Philosophy

- **Zero Dependencies**: uv doesn't require Python to be installed
- **Cross-Platform**: Native support for macOS, Linux, Windows
- **Standards Compliant**: Follows PEP 517, PEP 518, PEP 621
- **Backwards Compatible**: Maintains pip interface for easy migration

---

## Why Suggest to Use uv

### Performance Benchmarks

| Operation | pip Time | uv Time | Speed Improvement |
|-----------|-----------|-----------|------------------|
| Install requests (cold cache) | 1.2s | 0.08s | **15x faster** |
| Install Flask (warm cache) | 0.8s | 0.01s | **80x faster** |
| Resolve 50 packages | 2.5s | 0.03s | **83x faster** |
| Create virtual environment | 0.5s | 0.02s | **25x faster** |
| Install from requirements.txt | 3.2s | 0.12s | **27x faster** |

### Unified Toolchain Benefits

**Traditional Python Workflow** (6+ tools needed):
```bash
# 1. Install Python version
pyenv install 3.11.0
pyenv local 3.11.0

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Install development tools
pip install black flake8
pipx install ruff

# 5. Lock dependencies (pip-tools)
pip-compile requirements.in -o requirements.txt

# 6. Build and publish
python -m build
twine upload dist/*
```

**Modern uv Workflow** (1 tool):
```bash
# 1. Initialize project with Python version
uv init myproject --python 3.11.0

# 2. Install all dependencies
uv add requests flask
uv add --dev black flake8

# 3. Install global tools
uv tool install ruff

# 4. Lock dependencies (automatic)
uv lock

# 5. Build and publish
uv build
uv publish
```

### Advanced Capabilities

| Feature | Traditional Approach | uv Approach | Advantage |
|----------|-------------------|--------------|-----------|
| **Dependency Resolution** | pip (slow, basic resolver) | uv (fast, advanced resolver) | Handles complex conflicts |
| **Cross-Platform Locks** | pip-tools (platform-specific) | uv (universal lockfile) | Single lockfile works everywhere |
| **Parallel Operations** | pip (sequential) | uv (concurrent) | Faster downloads and installs |
| **Cache Management** | pip (per-env cache) | uv (global deduplication) | Disk space efficiency |
| **Build Isolation** | pip (shared build env) | uv (isolated builds) | Reproducible builds |

### Reliability & Ecosystem

- **Backed by Astral**: Same team behind Ruff (used by 500K+ projects)
- **Production Ready**: Battle-tested in enterprise environments
- **Active Development**: Weekly releases with rapid feature additions
- **Open Source**: MIT license, Apache 2.0 core
- **Community Driven**: 75K+ GitHub stars, active contributions

---

## How to Use uv to Replace pip

### Installation Methods

| Method | Command | Platform | Notes |
|--------|----------|----------|--------|
| **Standalone (Recommended)** | `curl -LsSf https://astral.sh/uv/install.sh | sh` | macOS, Linux | Self-updating |
| **Standalone** | `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` | Windows | Self-updating |
| **PyPI** | `pip install uv` | Any | Requires existing Python |
| **Homebrew** | `brew install uv` | macOS | Package manager |
| **WinGet** | `winget install --id=astral-sh.uv -e` | Windows | Package manager |
| **Cargo** | `cargo install --locked uv` | Any | Builds from source |

### Exact pip Command Replacements

#### Package Installation Commands

| pip Command | uv Equivalent | Exact Behavior |
|-------------|----------------|-----------------|
| `pip install package` | `uv pip install package` | Install package to current environment |
| `pip install package==1.2.3` | `uv pip install 'package==1.2.3'` | Install specific version |
| `pip install 'package>=1.0.0'` | `uv pip install 'package>=1.0.0'` | Install with version constraint |
| `pip install package1 package2` | `uv pip install package1 package2` | Install multiple packages |
| `pip install -r requirements.txt` | `uv pip install -r requirements.txt` | Install from requirements file |
| `pip install -e .` | `uv pip install -e .` | Install current directory as editable |
| `pip install git+https://github.com/user/repo` | `uv pip install "git+https://github.com/user/repo"` | Install from Git repository |
| `pip install "package[extra]"` | `uv pip install "package[extra]"` | Install with optional dependencies |

#### Virtual Environment Commands

| pip Command | uv Equivalent | Exact Behavior |
|-------------|----------------|-----------------|
| `python -m venv .venv` | `uv venv` | Create virtual environment at `.venv` |
| `python -m venv myenv` | `uv venv myenv` | Create virtual environment with custom name |
| `python -m venv --python 3.11 .venv` | `uv venv --python 3.11` | Create with specific Python version |
| `source .venv/bin/activate` | `source .venv/bin/activate` | Activate environment (same script) |
| `.venv\Scripts\activate` | `.venv\Scripts\activate` | Activate on Windows (same script) |
| `deactivate` | `deactivate` | Deactivate environment (same command) |

#### Package Management Commands

| pip Command | uv Equivalent | Exact Behavior |
|-------------|----------------|-----------------|
| `pip uninstall package` | `uv pip uninstall package` | Remove package from environment |
| `pip list` | `uv pip list` | List installed packages |
| `pip list --format json` | `uv pip list --format json` | List packages in JSON format |
| `pip freeze` | `uv pip freeze` | Output installed packages in requirements format |
| `pip show package` | `uv pip show package` | Show package details and metadata |
| `pip check` | `uv pip check` | Check for dependency conflicts |
| `pip search package` | *(No direct equivalent)* | Use PyPI website instead |

#### Requirements Compilation Commands

| pip-tools Command | uv Equivalent | Exact Behavior |
|------------------|----------------|-----------------|
| `pip-compile requirements.in` | `uv pip compile requirements.in` | Compile requirements to lockfile |
| `pip-compile requirements.in -o requirements.txt` | `uv pip compile requirements.in -o requirements.txt` | Write output to file |
| `pip-compile --upgrade-package package` | `uv pip compile --upgrade-package package` | Upgrade specific package in lockfile |
| `pip-compile --upgrade` | `uv pip compile --upgrade` | Upgrade all packages |
| `pip-sync requirements.txt` | `uv pip sync requirements.txt` | Sync environment with requirements file |

#### Advanced pip Commands

| pip Command | uv Equivalent | Exact Behavior |
|-------------|----------------|-----------------|
| `pip install --user package` | `uv pip install --system package` | Install to system environment |
| `pip install --no-deps package` | `uv pip install --no-deps package` | Install without dependencies |
| `pip install --index-url URL package` | `uv pip install --index-url URL package` | Use custom package index |
| `pip config list` | *(No direct equivalent)* | Use uv config settings |
| `pip cache dir` | `uv cache dir` | Show cache directory path |
| `pip cache purge` | `uv cache clean` | Clean package cache |

### Migration Scenarios

#### Scenario 1: Replace pip in Existing Project

```bash
# Before: Traditional pip workflow
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pytest black

# After: uv workflow (drop-in replacement)
uv venv
source .venv/bin/activate  # Optional, uv finds .venv automatically
uv pip install -r requirements.txt
uv pip install pytest black
```

#### Scenario 2: Migrate from pip-tools

```bash
# Before: pip-tools workflow
pip-compile requirements.in -o requirements.txt
pip-sync requirements.txt

# After: uv workflow (exact replacement)
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

#### Scenario 3: Modern Project Approach

```bash
# Recommended: Use uv's project management
uv init myproject
cd myproject

# Add dependencies (updates pyproject.toml and uv.lock automatically)
uv add requests flask
uv add --dev pytest black

# Run commands in managed environment
uv run python -c "import requests; print(requests.__version__)"
uv run pytest
uv run black .
```

---

## Modern Usage and Best Practices

### Project Management Workflow

#### Initialization & Setup

| Command | Purpose | When to Use |
|----------|---------|-------------|
| `uv init project-name` | Create new project | Starting new Python project |
| `uv init` | Initialize in current directory | Converting existing directory |
| `uv init --python 3.11` | Create with specific Python | Version-specific project |
| `uv add package` | Add runtime dependency | Adding required package |
| `uv add --dev package` | Add development dependency | Adding test/linting tool |
| `uv add -r requirements.txt` | Import from requirements.txt | Migrating existing project |

#### Project Structure

```
myproject/
├── .gitignore              # Git ignore file
├── .python-version          # Python version specification
├── pyproject.toml          # Project metadata and dependencies
├── uv.lock                 # Universal lockfile (commit to VCS)
├── src/                    # Source code
│   └── myproject/
│       └── __init__.py
├── tests/                   # Test files
│   └── test_main.py
└── README.md               # Project documentation
```

#### Dependency Management Best Practices

| Strategy | Command | Example |
|-----------|----------|----------|
| **Semantic Constraints** | `uv add 'package>=1.0.0,<2.0.0'` | `uv add 'requests>=2.28.0,<3.0.0'` |
| **Compatible Release** | `uv add 'package~=1.4.0'` | `uv add 'numpy~=1.24.0'` (>=1.24.0,<1.25.0) |
| **Separate Dev Dependencies** | `uv add --dev pytest black` | Keep dev tools separate |
| **Optional Dependencies** | `uv add 'package[extra]'` | `uv add 'fastapi[all]'` |
| **Git Dependencies** | `uv add "git+https://github.com/user/repo"` | Install from development branch |

### Environment Management

#### Python Version Management

| Command | Purpose | Example |
|----------|---------|----------|
| `uv python install 3.11 3.12` | Install multiple Python versions | Install Python 3.11 and 3.12 |
| `uv python list` | List available Python versions | See all installed versions |
| `uv python pin 3.11` | Pin Python version for project | Create `.python-version` file |
| `uv venv --python 3.11` | Create venv with specific Python | Use Python 3.11 for this environment |
| `uv run --python 3.12 script.py` | Run with specific Python | Execute script with Python 3.12 |

#### Virtual Environment Strategies

```bash
# 1. Let uv manage environments automatically (recommended)
uv run python script.py    # Creates and manages .venv automatically
uv run pytest          # Runs in project environment

# 2. Manual environment management
uv venv                 # Create .venv
uv sync                  # Install dependencies from lockfile
source .venv/bin/activate  # Activate manually
python script.py          # Run with activated environment

# 3. Multiple environments for different purposes
uv venv .venv-dev        # Development environment
uv venv .venv-test       # Testing environment
uv sync --python .venv-dev # Install to specific environment
```

### Script and Tool Management

#### Script Dependencies

Create script with inline metadata:

```python
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "requests>=2.28.0",
#     "click>=8.0.0",
# ]
# ///

import requests
import click

@click.command()
def main():
    response = requests.get("https://api.github.com")
    click.echo(f"GitHub API Status: {response.status_code}")

if __name__ == "__main__":
    main()
```

Run script with automatic dependency resolution:

```bash
uv run script.py
# Output: Reading inline script metadata from: script.py
# Output: Installed 2 packages in 12ms
# Output: GitHub API Status: 200
```

#### Global Tool Installation

| Command | Purpose | Example |
|----------|---------|----------|
| `uv tool install ruff` | Install global CLI tool | Install ruff linter globally |
| `uv tool install black` | Install code formatter | Install black formatter |
| `uv tool list` | List installed tools | See all global tools |
| `uv tool uninstall ruff` | Remove global tool | Uninstall ruff |
| `uvx ruff` | Run tool without installing | Execute ruff in ephemeral environment |

### Lockfile and Dependency Strategies

#### Universal Lockfile Management

```bash
# Create lockfile from pyproject.toml
uv lock

# Update specific package in lockfile
uv lock --upgrade-package requests

# Export lockfile to requirements.txt for legacy compatibility
uv pip compile pyproject.toml -o requirements.txt

# Create platform-specific requirements
uv pip compile pyproject.toml --universal -o requirements.txt
```

#### Constraint and Override Files

**constraints.txt** (additive bounds):
```
pydantic<2.0.0
requests>=2.28.0
```

**overrides.txt** (absolute replacements):
```
# Force specific version despite transitive conflicts
cryptography>=42.0.0
```

Usage:
```bash
uv pip compile requirements.in --constraint constraints.txt --override overrides.txt
```

### Performance Optimization

#### Cache Management

| Command | Purpose | When to Use |
|----------|---------|-------------|
| `uv cache info` | View cache statistics | Monitor cache usage |
| `uv cache clean` | Clear all cache | Resolve cache corruption |
| `uv cache dir` | Show cache location | Debug cache issues |

#### Network Optimization

```bash
# Use alternative index for faster downloads
uv add package --index-url https://pypi.doubanio.com/simple/

# Configure in pyproject.toml for project-wide use
[tool.uv]
index-url = "https://pypi.doubanio.com/simple/"

# Use multiple indexes
[tool.uv]
extra-index-url = [
    "https://download.pytorch.org/whl/cpu",
    "https://pypi.anaconda.org/scipy-wheels-nightly/simple"
]
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: Python CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up uv
        uses: astral-sh/setup-uv@v3
        
      - name: Install Python
        run: uv python install 3.11
        
      - name: Install dependencies
        run: uv sync
        
      - name: Run tests
        run: uv run pytest --cov=src
        
      - name: Run linting
        run: uv run ruff check src/
        
      - name: Check formatting
        run: uv run black --check src/
```

#### Docker Integration

```dockerfile
FROM python:3.11-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy project files
COPY pyproject.toml uv.lock ./
COPY src/ ./src/

# Install dependencies (frozen for reproducibility)
RUN uv sync --frozen

# Run application
CMD ["uv", "run", "python", "-m", "myproject"]
```

### Troubleshooting Common Issues

#### Dependency Conflicts

```bash
# Check for conflicts in environment
uv pip check

# View dependency tree
uv tree

# Resolve conflicts by updating constraints
uv add 'package_a>=2.0.0' 'package_b>=1.5.0'

# Use overrides for stubborn conflicts
uv pip compile requirements.in --override overrides.txt
```

#### Cache Issues

```bash
# Clear corrupted cache
uv cache clean

# Re-sync with fresh cache
uv sync --refresh

# Check cache location
uv cache dir
# Output: /home/user/.cache/uv
```

#### Environment Discovery

```bash
# Check which environment uv will use
uv venv --help

# Force specific environment
VIRTUAL_ENV=/path/to/custom/venv uv pip install package

# Use system Python (not recommended for development)
uv pip install --system package
```

### Advanced Workflows

#### Monorepo with Workspaces

```toml
# pyproject.toml (root)
[project]
name = "my-monorepo"
version = "0.1.0"

[tool.uv.workspace]
members = ["packages/*", "tools/*"]

[tool.uv.sources]
my-local-package = { workspace = true }
```

#### Build and Publish

```bash
# Build distributions (wheel and sdist)
uv build

# Build specific formats
uv build --wheel      # Wheel only
uv build --sdist      # Source distribution only

# Publish to PyPI
uv publish

# Publish to test index
uv publish --publish-url https://test.pypi.org/legacy/

# Build with specific Python version
uv build --python 3.11
```

---

## Summary and Recommendations

### Core Principles

1. **Use Project Management**: Prefer `uv init`/`uv add` over manual `uv pip` commands
2. **Commit Lockfiles**: Always commit `uv.lock` to version control for reproducibility
3. **Separate Concerns**: Use `--dev` for development tools, runtime dependencies for production
4. **Leverage Caching**: Trust uv's global cache for performance and disk efficiency
5. **Use uv run**: Let uv manage environments automatically for consistency
6. **Pin Python Versions**: Use `.python-version` for team consistency
7. **Prefer Universal Lockfiles**: Use `uv.lock` over platform-specific requirements.txt

### Migration Path

| Stage | Approach | Commands |
|-------|-----------|----------|
| **Beginner** | Direct pip replacement | `uv pip install`, `uv pip list`, `uv pip uninstall` |
| **Intermediate** | Project management | `uv init`, `uv add`, `uv run` |
| **Advanced** | Full uv ecosystem | Workspaces, custom indexes, CI/CD integration |

### When to Use Each Approach

| Scenario | Recommended Method |
|-----------|-------------------|
| Quick script execution | `uv run script.py` with inline metadata |
| Existing pip project | `uv pip install -r requirements.txt` for gradual migration |
| New Python project | `uv init && uv add package` for modern workflow |
| Development tools | `uv tool install ruff` for global CLI tools |
| Production deployment | `uv sync --frozen` for reproducible builds |
| Complex monorepo | `uv workspaces` for multi-package management |

---

## Resources & Advanced

### Official Documentation
- uv Official Docs: https://docs.astral.sh/uv/
- GitHub Repository: https://github.com/astral-sh/uv
- PyPI Package: https://pypi.org/project/uv/
- Benchmarks: https://github.com/astral-sh/uv/blob/main/BENCHMARKS.md

### Community & Support
- Discord Community: https://discord.gg/astral-sh
- GitHub Discussions: https://github.com/astral-sh/uv/discussions
- Issue Tracking: https://github.com/astral-sh/uv/issues

### Related Tools
- Ruff (by same team): https://github.com/astral-sh/ruff
- Astral (company): https://astral.sh/