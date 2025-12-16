# Complete Guide to pyproject.toml: Modern Python Project Configuration

## Table of Contents
1. [What is pyproject.toml](#what-is-pyprojecttoml)
2. [Why Use pyproject.toml](#why-use-pyprojecttoml)
3. [Core Structure and Sections](#core-structure-and-sections)
4. [Advanced Configuration and Best Practices](#advanced-configuration-and-best-practices)

---

## What is pyproject.toml

### Overview

`pyproject.toml` is the standardized configuration file for Python projects, defined by PEP 518 and enhanced by subsequent PEPs. It serves as a single source of truth for project metadata, dependencies, build configuration, and tool settings.

### Historical Evolution

| Year | PEP | Purpose | Impact |
|------|-----|---------|--------|
| **2016** | PEP 518 | Introduces `pyproject.toml` for build system requirements | Replaces `setup.py` for basic build configuration |
| **2016** | PEP 517 | Standardizes build frontends | Enables isolated builds and reproducible packaging |
| **2020** | PEP 621 | Standardizes project metadata | Replaces `setup.cfg`/`setup.py` for project information |
| **2021** | PEP 660 | Supports editable installs for PEP 517 builds | Improves development workflow |
| **2022** | PEP 639 | Enhances dependency specification | Improves dependency metadata and resolution |

### Core Philosophy

- **Declarative Configuration**: Describe what to build, not how to build it
- **Tool Agnostic**: Standard format supported by all modern Python tools
- **Build System Isolation**: Separate project metadata from build logic
- **Reproducible Builds**: Same configuration produces identical results across environments

---

## Why Use pyproject.toml

### Traditional vs Modern Configuration

**Traditional Approach** (multiple files):
```
setup.py          # Build script (complex, Python code)
setup.cfg         # Configuration (limited metadata)
requirements.txt  # Dependencies (no dev/prod separation)
MANIFEST.in       # File inclusion rules
tox.ini           # Testing configuration
.flake8           # Linting configuration
.black            # Formatting configuration
```

**Modern Approach** (single file):
```
pyproject.toml    # All configuration in one place
```

### Benefits Overview

| Aspect | Traditional | Modern (pyproject.toml) | Advantage |
|--------|-------------|-------------------------|-----------|
| **Configuration** | Multiple files, different formats | Single TOML file | Unified configuration management |
| **Metadata** | Python code in setup.py | Declarative TOML sections | No code execution, safer |
| **Dependencies** | requirements.txt (flat) | Structured with groups | Dev/prod separation, optional deps |
| **Build System** | Implicit/setuptools | Explicit PEP 517/518 | Reproducible, tool-agnostic |
| **Tool Config** | Separate config files | Integrated sections | Centralized settings |
| **IDE Support** | Limited parsing | Standardized format | Better IDE integration |

### Tool Ecosystem Compatibility

| Tool Category | Tools Supporting pyproject.toml | Integration Level |
|---------------|--------------------------------|------------------|
| **Build Tools** | setuptools, hatch, flit, pdm, poetry | Native support |
| **Package Managers** | pip, uv, pip-tools, conda | Full compatibility |
| **Linting/Formatting** | black, ruff, flake8, mypy, isort | Native configuration |
| **Testing** | pytest, tox, coverage, nox | Integrated settings |
| **Documentation** | sphinx, mkdocs, pdoc | Configuration sections |
| **CI/CD** | GitHub Actions, GitLab CI, pre-commit | Standard parsing |

### Real-World Adoption

- **PyPI**: 95%+ of new packages use pyproject.toml (2024)
- **Enterprise**: Standard in major companies (Google, Microsoft, Meta)
- **Open Source**: Required by many foundations (Apache, Python Software Foundation)
- **Education**: Teaching standard in Python courses and bootcamps

---

## Core Structure and Sections

### Basic File Structure

```toml
# pyproject.toml - Complete example structure

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-awesome-package"
version = "1.0.0"
description = "A brief description of your package"
readme = "README.md"
license = {text = "MIT"}
authors = [
    {name = "John Doe", email = "john@example.com"}
]
maintainers = [
    {name = "Jane Smith", email = "jane@example.com"}
]
keywords = ["python", "package", "example"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
requires-python = ">=3.8"
dependencies = [
    "requests>=2.28.0",
    "click>=8.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=22.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]
docs = [
    "sphinx>=5.0.0",
    "sphinx-rtd-theme>=1.0.0",
]
test = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "pytest-xdist>=3.0.0",
]

[project.urls]
Homepage = "https://github.com/username/my-awesome-package"
Documentation = "https://my-awesome-package.readthedocs.io/"
Repository = "https://github.com/username/my-awesome-package.git"
"Bug Tracker" = "https://github.com/username/my-awesome-package/issues"
Changelog = "https://github.com/username/my-awesome-package/blob/main/CHANGELOG.md"

[project.scripts]
my-cli = "my_package.cli:main"

[project.gui-scripts]
my-gui = "my_package.gui:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
my_package = ["data/*.json", "templates/*.html"]

# Tool configurations
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''

[tool.ruff]
line-length = 88
target-version = "py38"
select = ["E", "F", "W", "I", "N", "B", "C90"]
ignore = ["E501", "B008"]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]
"tests/*" = ["S101"]

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
minversion = "7.0"
addopts = "-ra -q --strict-markers --strict-config"
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
```

### Build System Section

#### PEP 517/518 Configuration

```toml
[build-system]
requires = [
    "setuptools>=61.0",
    "wheel",
    "setuptools_scm[toml]>=6.2",
]
build-backend = "setuptools.build_meta"
```

| Build Backend | When to Use | Features |
|---------------|-------------|----------|
| **setuptools** | Traditional projects, complex builds | Full feature set, extensive ecosystem |
| **hatch** | Modern projects, plugins | Fast, extensible, excellent defaults |
| **flit** | Simple pure Python packages | Minimal configuration, PyPI publishing |
| **pdm** | Poetry-like workflow | Dependency management, virtual environments |
| **maturin** | Rust extensions | Rust-Python interop, PyO3 integration |

#### Backend-Specific Examples

**Hatch Configuration:**
```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.version]
path = "src/my_package/__init__.py"

[tool.hatch.build.targets.sdist]
include = [
    "/src",
    "/tests",
    "/README.md",
]

[tool.hatch.build.targets.wheel]
packages = ["src/my_package"]
```

**Flit Configuration:**
```toml
[build-system]
requires = ["flit_core >=3.2,<4"]
build-backend = "flit_core.buildapi"

[tool.flit.module]
name = "my_package"

[tool.flit.sdist]
include = ["tests/", "CHANGELOG.md"]
```

### Project Section (PEP 621)

#### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Package name (PyPI compatible) | `"my-package"` |
| `version` | string | Version string (PEP 440) | `"1.2.3"` |
| `requires-python` | string | Minimum Python version | `">=3.8"` |

#### Recommended Fields

| Field | Type | Purpose | Best Practice |
|-------|------|---------|---------------|
| `description` | string | Short package description | One sentence, < 100 chars |
| `readme` | string or table | Long description file | Use `"README.md"` |
| `license` | string or table | License information | Use `{text = "MIT"}` |
| `authors` | array of tables | Package authors | Include name and email |
| `keywords` | array of strings | Search keywords | 5-10 relevant terms |
| `classifiers` | array of strings | PyPI classifiers | Use standard classifiers |

#### Version Management Strategies

**Static Version:**
```toml
[project]
version = "1.2.3"
```

**Dynamic Version (SCM):**
```toml
[project]
dynamic = ["version"]

[tool.setuptools_scm]
```

**File-based Version:**
```toml
[project]
dynamic = ["version"]

[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
```

### Dependencies Management

#### Runtime Dependencies

```toml
[project]
dependencies = [
    # Exact version
    "requests==2.31.0",
    
    # Minimum version
    "click>=8.0.0",
    
    # Compatible release operator
    "numpy~=1.24.0",  # >=1.24.0, <1.25.0
    
    # Version range
    "pandas>=1.5.0,<3.0.0",
    
    # With extras
    "fastapi[all]>=0.100.0",
    
    # Git dependency
    "my-lib @ git+https://github.com/user/my-lib.git@main",
    
    # Local path
    "local-lib @ file://./libs/local-lib",
    
    # URL dependency
    "package @ https://example.com/package-1.0.0.tar.gz",
]
```

#### Optional Dependencies (Groups)

```toml
[project.optional-dependencies]
# Development tools
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
    "pre-commit>=3.0.0",
]

# Documentation
docs = [
    "sphinx>=6.0.0",
    "sphinx-rtd-theme>=1.2.0",
    "myst-parser>=1.0.0",
]

# Testing
test = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "pytest-xdist>=3.0.0",
    "pytest-mock>=3.10.0",
]

# Performance profiling
perf = [
    "py-spy>=0.3.0",
    "memory-profiler>=0.60.0",
    "line-profiler>=4.0.0",
]

# Jupyter notebook support
jupyter = [
    "jupyter>=1.0.0",
    "ipykernel>=6.0.0",
    "jupyterlab>=4.0.0",
]

# Combined groups
all = [
    "my-package[dev,test,docs]",
]
```

#### Dependency Specification Patterns

| Pattern | Syntax | Use Case |
|---------|--------|----------|
| **Exact** | `package==1.2.3` | Critical security patches |
| **Minimum** | `package>=1.2.3` | Backward compatible updates |
| **Compatible** | `package~=1.2.3` | Same major/minor version |
| **Range** | `package>=1.2.3,<2.0.0` | Controlled version range |
| **Excluded** | `package>=1.2.3,!=1.2.5` | Avoid buggy versions |

### Entry Points and Scripts

#### Console Scripts

```toml
[project.scripts]
# Simple command
my-cli = "my_package.cli:main"

# Command with arguments
my-tool = "my_package.tool:cli_main"

# Multiple commands
server = "my_package.server:start"
client = "my_package.client:run"
worker = "my_package.worker:process"
```

#### GUI Scripts

```toml
[project.gui-scripts]
my-gui = "my_package.gui:main_app"
```

#### Other Entry Points

```toml
[project.entry-points."my_plugin.category"]
plugin1 = "my_package.plugins:Plugin1"
plugin2 = "my_package.plugins:Plugin2"

[project.entry-points."pytest11"]
my_pytest_plugin = "my_package.testing:pytest_plugin"

[project.entry-points."console_scripts"]
# Alternative syntax for scripts
```

---

## Advanced Configuration and Best Practices

### Tool Configuration Sections

#### Code Formatting (Black)

```toml
[tool.black]
line-length = 88
target-version = ['py38', 'py39', 'py310']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''

# Black-specific options
skip-string-normalization = false
skip-magic-trailing-comma = false
preview = true  # Enable preview features
```

#### Linting and Formatting (Ruff)

```toml
[tool.ruff]
line-length = 88
target-version = "py38"
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "B",      # flake8-bugbear
    "C90",    # mccabe
    "UP",     # pyupgrade
    "RUF",    # ruff-specific rules
]
ignore = [
    "E501",   # line too long (handled by black)
    "B008",   # do not perform function calls in argument defaults
    "RUF012", # mutable class default
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # unused imports
"tests/*" = [
    "S101",   # use of assert detected
    "ARG001", # unused function argument
    "PLR2004", # magic value comparison
]

[tool.ruff.isort]
known-first-party = ["my_package"]
known-third-party = ["requests", "click"]
split-on-trailing-comma = true

[tool.ruff.mccabe]
max-complexity = 10

[tool.ruff.pydocstyle]
convention = "google"
```

#### Type Checking (MyPy)

```toml
[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
disallow_subclassing_any = true
disallow_untyped_calls = true
disallow_incomplete_defs = true
check_untyped_defs = true
disallow_untyped_decorators = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[tool.mypy.packages]
my_package = "src/my_package"

[tool.mypy.plugins]
sqlalchemy.ext.mypy.plugin = true

[[tool.mypy.overrides]]
module = [
    "requests.*",
    "click.*",
]
ignore_missing_imports = true
```

#### Testing (pytest)

```toml
[tool.pytest.ini_options]
minversion = "7.0"
addopts = [
    "-ra",
    "-q",
    "--strict-markers",
    "--strict-config",
    "--cov=src/my_package",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-report=xml",
]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
    "unit: marks tests as unit tests",
    "network: marks tests that require network access",
]
filterwarnings = [
    "error",
    "ignore::UserWarning",
    "ignore::DeprecationWarning",
]

[tool.coverage.run]
source = ["src"]
omit = [
    "*/tests/*",
    "*/test_*",
    "*/__pycache__/*",
    "*/site-packages/*",
]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "if self.debug:",
    "if settings.DEBUG",
    "raise AssertionError",
    "raise NotImplementedError",
    "if 0:",
    "if __name__ == .__main__.:",
    "class .*\\bProtocol\\):",
    "@(abc\\.)?abstractmethod",
]
```

### Environment and Build Configuration

#### Environment-Specific Settings

```toml
[tool.uv]
dev-dependencies = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]

[tool.uv.sources]
my-local-package = { workspace = true }
experimental-lib = { git = "https://github.com/user/experimental-lib" }

[tool.hatch.envs.default]
dependencies = [
    "coverage[toml]>=6.0",
    "pytest",
]

[tool.hatch.envs.test]
dependencies = [
    "pytest-cov",
    "pytest-xdist",
]

[[tool.hatch.envs.test.matrix]]
python = ["3.8", "3.9", "3.10", "3.11", "3.12"]
```

#### Build Customization

```toml
[tool.setuptools]
package-dir = {"" = "src"}

[tool.setuptools.packages.find]
where = ["src"]
include = ["my_package*"]
exclude = ["tests*"]

[tool.setuptools.package-data]
my_package = ["data/*.json", "templates/*.html", "static/*"]

[tool.setuptools.exclude-package-data]
"*" = ["*.pyc", "__pycache__"]

[tool.setuptools.dynamic]
readme = {file = ["README.md", "CHANGELOG.md"], content-type = "text/markdown"}
dependencies = {file = ["requirements.txt"]}
```

### Documentation Configuration

#### Sphinx Configuration

```toml
[tool.sphinx]
source-dir = "docs/source"
build-dir = "docs/build"
config-dir = "docs/source"

[tool.sphinx.config]
project = "My Package"
author = "John Doe"
release = "1.0.0"
language = "en"

[tool.sphinx.config.extensions]
sphinx.ext.autodoc = true
sphinx.ext.viewcode = true
sphinx.ext.napoleon = true
myst_parser = true

[tool.sphinx.config.html_theme]
name = "sphinx_rtd_theme"
highlight_language = "python"

[tool.sphinx.config.intersphinx_mapping]
python = ["https://docs.python.org/3/", null]
requests = ["https://requests.readthedocs.io/en/latest/", null]
```

### CI/CD Integration Patterns

#### GitHub Actions Integration

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.8", "3.9", "3.10", "3.11", "3.12"]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
          
      - name: Install uv
        uses: astral-sh/setup-uv@v3
        
      - name: Install dependencies
        run: uv sync --all-extras --dev
        
      - name: Run linting
        run: uv run ruff check src/
        
      - name: Run type checking
        run: uv run mypy src/
        
      - name: Run tests
        run: uv run pytest --cov=src/
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.0.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

### Advanced Patterns and Techniques

#### Monorepo Configuration

```toml
# Root pyproject.toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "my-monorepo"
version = "0.1.0"
dependencies = []

[tool.uv.workspace]
members = ["packages/*", "tools/*"]

[tool.hatch.envs.default]
dependencies = ["hatch"]

# packages/package1/pyproject.toml
[project]
name = "package1"
version = "0.1.0"
dependencies = [
    "package2 @ {root = packages/package2}",  # Workspace dependency
]

[tool.hatch.build.targets.wheel]
packages = ["src/package1"]
```

#### Conditional Dependencies

```toml
[project.optional-dependencies]
# Platform-specific dependencies
windows = ["pywin32>=227"]
linux = ["python-systemd>=234"]
macos = ["pyobjc-framework-Cocoa>=8.0"]

# Python version-specific
py38 = ["typing-extensions>=4.0.0"]
py39plus = ["zoneinfo>=0.2.1"]

# Feature-specific
ml = ["scikit-learn>=1.0.0", "numpy>=1.20.0"]
web = ["fastapi>=0.100.0", "uvicorn>=0.20.0"]

# Combine conditionally
test = [
    "my-package[windows]" if sys_platform == "win32" else "my-package[linux]",
    "pytest>=7.0.0",
]
```

#### Dynamic Configuration

```toml
[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
readme = {file = ["README.md"], content-type = "text/markdown"}
dependencies = {file = ["requirements.in"]}

[tool.setuptools.dynamic.optional-dependencies]
dev = {file = ["requirements-dev.in"]}
test = {file = ["requirements-test.in"]}

# Dynamic scripts
[tool.setuptools.dynamic.scripts]
my-cli = {cmd = "my_package.cli:main", scope = "console"}
```

### Migration and Best Practices

#### Migration from setup.py

**Before (setup.py):**
```python
from setuptools import setup, find_packages

setup(
    name="my-package",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "requests>=2.28.0",
        "click>=8.0.0",
    ],
    extras_require={
        "dev": ["pytest", "black"],
    },
    entry_points={
        "console_scripts": [
            "my-cli=my_package.cli:main",
        ],
    },
)
```

**After (pyproject.toml):**
```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "1.0.0"
dependencies = [
    "requests>=2.28.0",
    "click>=8.0.0",
]

[project.optional-dependencies]
dev = ["pytest", "black"]

[project.scripts]
my-cli = "my_package.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
```

#### Common Pitfalls and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **Import errors** | Missing `packages.find` configuration | Add `[tool.setuptools.packages.find]` |
| **Version conflicts** | Static version with SCM tools | Use `dynamic = ["version"]` |
| **Missing data files** | Not including package-data | Configure `[tool.setuptools.package-data]` |
| **Build failures** | Incompatible build backend | Update `build-system.requires` |
| **Tool conflicts** | Overlapping tool configurations | Use tool-specific sections |

#### Validation and Testing

```bash
# Validate pyproject.toml syntax
python -c 'import tomllib; tomllib.load(open("pyproject.toml", "rb"))'

# Check build system
python -m build --help

# Test installation
pip install -e .

# Validate metadata
pip show my-package

# Test with different tools
uv init --from pyproject.toml
hatch new --init
pdm add --dev pytest
```

---

## Summary and Recommendations

### Core Principles

1. **Single Source of Truth**: Keep all configuration in `pyproject.toml`
2. **Standard Compliance**: Follow PEP 517/518/621 specifications
3. **Tool Integration**: Use tool-specific sections for configuration
4. **Dependency Management**: Separate runtime and development dependencies
5. **Version Strategy**: Choose appropriate version management approach
6. **Build Isolation**: Use PEP 517 compatible build backends
7. **Documentation**: Maintain comprehensive README and inline documentation

### Best Practices Checklist

- [ ] Use `[build-system]` with explicit requirements
- [ ] Include all required `[project]` fields
- [ ] Separate runtime and optional dependencies
- [ ] Configure all tools in `[tool.*]` sections
- [ ] Use semantic versioning (PEP 440)
- [ ] Include comprehensive classifiers
- [ ] Add entry points for CLI tools
- [ ] Configure testing and CI/CD integration
- [ ] Validate configuration before publishing
- [ ] Keep dependencies minimal and secure

### Tool Selection Guide

| Project Type | Recommended Backend | Tools |
|--------------|-------------------|-------|
| **Simple Library** | flit | black, ruff, pytest |
| **Complex Application** | setuptools | mypy, sphinx, pre-commit |
| **Modern Development** | hatch | uv, ruff, pytest |
| **Enterprise** | setuptools + custom | Full toolchain |
| **Data Science** | setuptools | numpy, pandas, jupyter |

### Resources and References

#### Official Documentation
- PEP 518: https://peps.python.org/pep-0518/
- PEP 517: https://peps.python.org/pep-0517/
- PEP 621: https://peps.python.org/pep-0621/
- PyPA Projects: https://www.pypa.io/en/latest/
- TOML Specification: https://toml.io/en/

#### Tool Documentation
- setuptools: https://setuptools.pypa.io/
- hatch: https://hatch.pypa.io/
- flit: https://flit.pypa.io/en/stable/
- pip: https://pip.pypa.io/en/stable/
- uv: https://docs.astral.sh/uv/

#### Community Resources
- Python Packaging Guide: https://packaging.python.org/
- PyPI: https://pypi.org/
- Python Discourse: https://discuss.python.org/
- Real Python: https://realpython.com/