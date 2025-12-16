# pyproject.toml 完整指南：现代 Python 项目配置

## 目录
1. [什么是 pyproject.toml](#什么是-pyprojecttoml)
2. [为什么要使用 pyproject.toml](#为什么要使用-pyprojecttoml)
3. [核心结构和章节](#核心结构和章节)
4. [高级配置和最佳实践](#高级配置和最佳实践)

---

## 什么是 pyproject.toml

### 概述

`pyproject.toml` 是 Python 项目的标准化配置文件，由 PEP 518 定义并由后续 PEP 增强。它作为项目元数据、依赖项、构建配置和工具设置的单一真实来源。

### 历史演进

| 年份 | PEP | 目的 | 影响 |
|------|-----|---------|--------|
| **2016** | PEP 518 | 引入 `pyproject.toml` 用于构建系统要求 | 替换 `setup.py` 进行基本构建配置 |
| **2016** | PEP 517 | 标准化构建前端 | 启用隔离构建和可重现打包 |
| **2020** | PEP 621 | 标准化项目元数据 | 替换 `setup.cfg`/`setup.py` 进行项目信息 |
| **2021** | PEP 660 | 支持 PEP 517 构建的可编辑安装 | 改进开发工作流 |
| **2022** | PEP 639 | 增强依赖规范 | 改进依赖元数据和解析 |

### 核心理念

- **声明式配置**：描述要构建什么，而不是如何构建
- **工具无关**：所有现代 Python 工具支持的标准格式
- **构建系统隔离**：将项目元数据与构建逻辑分离
- **可重现构建**：相同配置在不同环境中产生相同结果

---

## 为什么要使用 pyproject.toml

### 传统与现代配置对比

**传统方法**（多个文件）：
```
setup.py          # 构建脚本（复杂，Python 代码）
setup.cfg         # 配置（元数据有限）
requirements.txt  # 依赖项（无开发/生产分离）
MANIFEST.in       # 文件包含规则
tox.ini           # 测试配置
.flake8           # 代码检查配置
.black            # 格式化配置
```

**现代方法**（单一文件）：
```
pyproject.toml    # 所有配置集中在一个文件中
```

### 优势概览

| 方面 | 传统 | 现代（pyproject.toml） | 优势 |
|--------|-------------|-------------------------|-----------|
| **配置** | 多个文件，不同格式 | 单一 TOML 文件 | 统一配置管理 |
| **元数据** | setup.py 中的 Python 代码 | 声明式 TOML 章节 | 无代码执行，更安全 |
| **依赖项** | requirements.txt（扁平） | 结构化分组 | 开发/生产分离，可选依赖 |
| **构建系统** | 隐式/setuptools | 显式 PEP 517/518 | 可重现，工具无关 |
| **工具配置** | 分离的配置文件 | 集成章节 | 集中化设置 |
| **IDE 支持** | 解析有限 | 标准化格式 | 更好的 IDE 集成 |

### 工具生态系统兼容性

| 工具类别 | 支持 pyproject.toml 的工具 | 集成级别 |
|---------------|--------------------------------|------------------|
| **构建工具** | setuptools, hatch, flit, pdm, poetry | 原生支持 |
| **包管理器** | pip, uv, pip-tools, conda | 完全兼容 |
| **代码检查/格式化** | black, ruff, flake8, mypy, isort | 原生配置 |
| **测试** | pytest, tox, coverage, nox | 集成设置 |
| **文档** | sphinx, mkdocs, pdoc | 配置章节 |
| **CI/CD** | GitHub Actions, GitLab CI, pre-commit | 标准解析 |

### 现实世界采用情况

- **PyPI**：95%+ 的新包使用 pyproject.toml（2024年）
- **企业**：大公司的标准（Google、Microsoft、Meta）
- **开源**：许多基金会的要求（Apache、Python 软件基金会）
- **教育**：Python 课程和训练营的教学标准

---

## 核心结构和章节

### 基本文件结构

```toml
# pyproject.toml - 完整示例结构

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-awesome-package"
version = "1.0.0"
description = "包的简要描述"
readme = "README.md"
license = {text = "MIT"}
authors = [
    {name = "张三", email = "zhangsan@example.com"}
]
maintainers = [
    {name = "李四", email = "lisi@example.com"}
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

# 工具配置
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
extend-exclude = '''
/(
  # 目录
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

### 构建系统章节

#### PEP 517/518 配置

```toml
[build-system]
requires = [
    "setuptools>=61.0",
    "wheel",
    "setuptools_scm[toml]>=6.2",
]
build-backend = "setuptools.build_meta"
```

| 构建后端 | 何时使用 | 特性 |
|---------------|-------------|----------|
| **setuptools** | 传统项目，复杂构建 | 完整功能集，广泛生态 |
| **hatch** | 现代项目，插件 | 快速，可扩展，优秀默认值 |
| **flit** | 简单纯 Python 包 | 最小配置，PyPI 发布 |
| **pdm** | Poetry 类工作流 | 依赖管理，虚拟环境 |
| **maturin** | Rust 扩展 | Rust-Python 互操作，PyO3 集成 |

#### 后端特定示例

**Hatch 配置：**
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

**Flit 配置：**
```toml
[build-system]
requires = ["flit_core >=3.2,<4"]
build-backend = "flit_core.buildapi"

[tool.flit.module]
name = "my_package"

[tool.flit.sdist]
include = ["tests/", "CHANGELOG.md"]
```

### 项目章节（PEP 621）

#### 必需字段

| 字段 | 类型 | 描述 | 示例 |
|-------|------|-------------|---------|
| `name` | 字符串 | 包名（PyPI 兼容） | `"my-package"` |
| `version` | 字符串 | 版本字符串（PEP 440） | `"1.2.3"` |
| `requires-python` | 字符串 | 最低 Python 版本 | `">=3.8"` |

#### 推荐字段

| 字段 | 类型 | 目的 | 最佳实践 |
|-------|------|---------|---------------|
| `description` | 字符串 | 简短包描述 | 一句话，< 100 字符 |
| `readme` | 字符串或表格 | 长描述文件 | 使用 `"README.md"` |
| `license` | 字符串或表格 | 许可证信息 | 使用 `{text = "MIT"}` |
| `authors` | 表格数组 | 包作者 | 包含姓名和邮箱 |
| `keywords` | 字符串数组 | 搜索关键词 | 5-10 个相关术语 |
| `classifiers` | 字符串数组 | PyPI 分类器 | 使用标准分类器 |

#### 版本管理策略

**静态版本：**
```toml
[project]
version = "1.2.3"
```

**动态版本（SCM）：**
```toml
[project]
dynamic = ["version"]

[tool.setuptools_scm]
```

**基于文件的版本：**
```toml
[project]
dynamic = ["version"]

[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
```

### 依赖管理

#### 运行时依赖

```toml
[project]
dependencies = [
    # 精确版本
    "requests==2.31.0",
    
    # 最低版本
    "click>=8.0.0",
    
    # 兼容发布操作符
    "numpy~=1.24.0",  # >=1.24.0, <1.25.0
    
    # 版本范围
    "pandas>=1.5.0,<3.0.0",
    
    # 带额外功能
    "fastapi[all]>=0.100.0",
    
    # Git 依赖
    "my-lib @ git+https://github.com/user/my-lib.git@main",
    
    # 本地路径
    "local-lib @ file://./libs/local-lib",
    
    # URL 依赖
    "package @ https://example.com/package-1.0.0.tar.gz",
]
```

#### 可选依赖（分组）

```toml
[project.optional-dependencies]
# 开发工具
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
    "pre-commit>=3.0.0",
]

# 文档
docs = [
    "sphinx>=6.0.0",
    "sphinx-rtd-theme>=1.2.0",
    "myst-parser>=1.0.0",
]

# 测试
test = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "pytest-xdist>=3.0.0",
    "pytest-mock>=3.10.0",
]

# 性能分析
perf = [
    "py-spy>=0.3.0",
    "memory-profiler>=0.60.0",
    "line-profiler>=4.0.0",
]

# Jupyter notebook 支持
jupyter = [
    "jupyter>=1.0.0",
    "ipykernel>=6.0.0",
    "jupyterlab>=4.0.0",
]

# 组合分组
all = [
    "my-package[dev,test,docs]",
]
```

#### 依赖规范模式

| 模式 | 语法 | 使用场景 |
|---------|--------|----------|
| **精确** | `package==1.2.3` | 关键安全补丁 |
| **最低** | `package>=1.2.3` | 向后兼容更新 |
| **兼容** | `package~=1.2.3` | 相同主/次版本 |
| **范围** | `package>=1.2.3,<2.0.0` | 受控版本范围 |
| **排除** | `package>=1.2.3,!=1.2.5` | 避免有问题的版本 |

### 入口点和脚本

#### 控制台脚本

```toml
[project.scripts]
# 简单命令
my-cli = "my_package.cli:main"

# 带参数的命令
my-tool = "my_package.tool:cli_main"

# 多个命令
server = "my_package.server:start"
client = "my_package.client:run"
worker = "my_package.worker:process"
```

#### GUI 脚本

```toml
[project.gui-scripts]
my-gui = "my_package.gui:main_app"
```

#### 其他入口点

```toml
[project.entry-points."my_plugin.category"]
plugin1 = "my_package.plugins:Plugin1"
plugin2 = "my_package.plugins:Plugin2"

[project.entry-points."pytest11"]
my_pytest_plugin = "my_package.testing:pytest_plugin"

[project.entry-points."console_scripts"]
# 脚本的替代语法
```

---

## 高级配置和最佳实践

### 工具配置章节

#### 代码格式化（Black）

```toml
[tool.black]
line-length = 88
target-version = ['py38', 'py39', 'py310']
include = '\.pyi?$'
extend-exclude = '''
/(
  # 目录
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

# Black 特定选项
skip-string-normalization = false
skip-magic-trailing-comma = false
preview = true  # 启用预览功能
```

#### 代码检查和格式化（Ruff）

```toml
[tool.ruff]
line-length = 88
target-version = "py38"
select = [
    "E",      # pycodestyle 错误
    "W",      # pycodestyle 警告
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "B",      # flake8-bugbear
    "C90",    # mccabe
    "UP",     # pyupgrade
    "RUF",    # ruff 特定规则
]
ignore = [
    "E501",   # 行太长（由 black 处理）
    "B008",   # 不要在参数默认值中执行函数调用
    "RUF012", # 可变类默认值
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # 未使用的导入
"tests/*" = [
    "S101",   # 检测到 assert 的使用
    "ARG001", # 未使用的函数参数
    "PLR2004", # 魔术值比较
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

#### 类型检查（MyPy）

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

#### 测试（pytest）

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
    "slow: 标记慢速测试（使用 '-m \"not slow\"' 取消选择）",
    "integration: 标记集成测试",
    "unit: 标记单元测试",
    "network: 标记需要网络访问的测试",
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

### 环境和构建配置

#### 环境特定设置

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

#### 构建自定义

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

### 文档配置

#### Sphinx 配置

```toml
[tool.sphinx]
source-dir = "docs/source"
build-dir = "docs/build"
config-dir = "docs/source"

[tool.sphinx.config]
project = "My Package"
author = "张三"
release = "1.0.0"
language = "zh"

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

### CI/CD 集成模式

#### GitHub Actions 集成

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
      
      - name: 设置 Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
          
      - name: 安装 uv
        uses: astral-sh/setup-uv@v3
        
      - name: 安装依赖
        run: uv sync --all-extras --dev
        
      - name: 运行代码检查
        run: uv run ruff check src/
        
      - name: 运行类型检查
        run: uv run mypy src/
        
      - name: 运行测试
        run: uv run pytest --cov=src/
        
      - name: 上传覆盖率
        uses: codecov/codecov-action@v3
```

#### Pre-commit 配置

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

### 高级模式和技巧

#### 单仓库配置

```toml
# 根目录 pyproject.toml
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
    "package2 @ {root = packages/package2}",  # 工作区依赖
]

[tool.hatch.build.targets.wheel]
packages = ["src/package1"]
```

#### 条件依赖

```toml
[project.optional-dependencies]
# 平台特定依赖
windows = ["pywin32>=227"]
linux = ["python-systemd>=234"]
macos = ["pyobjc-framework-Cocoa>=8.0"]

# Python 版本特定
py38 = ["typing-extensions>=4.0.0"]
py39plus = ["zoneinfo>=0.2.1"]

# 功能特定
ml = ["scikit-learn>=1.0.0", "numpy>=1.20.0"]
web = ["fastapi>=0.100.0", "uvicorn>=0.20.0"]

# 条件组合
test = [
    "my-package[windows]" if sys_platform == "win32" else "my-package[linux]",
    "pytest>=7.0.0",
]
```

#### 动态配置

```toml
[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
readme = {file = ["README.md"], content-type = "text/markdown"}
dependencies = {file = ["requirements.in"]}

[tool.setuptools.dynamic.optional-dependencies]
dev = {file = ["requirements-dev.in"]}
test = {file = ["requirements-test.in"]}

# 动态脚本
[tool.setuptools.dynamic.scripts]
my-cli = {cmd = "my_package.cli:main", scope = "console"}
```

### 迁移和最佳实践

#### 从 setup.py 迁移

**之前（setup.py）：**
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

**之后（pyproject.toml）：**
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

#### 常见陷阱和解决方案

| 问题 | 原因 | 解决方案 |
|-------|-------|----------|
| **导入错误** | 缺少 `packages.find` 配置 | 添加 `[tool.setuptools.packages.find]` |
| **版本冲突** | 静态版本与 SCM 工具冲突 | 使用 `dynamic = ["version"]` |
| **缺少数据文件** | 未包含 package-data | 配置 `[tool.setuptools.package-data]` |
| **构建失败** | 不兼容的构建后端 | 更新 `build-system.requires` |
| **工具冲突** | 重叠的工具配置 | 使用工具特定章节 |

#### 验证和测试

```bash
# 验证 pyproject.toml 语法
python -c 'import tomllib; tomllib.load(open("pyproject.toml", "rb"))'

# 检查构建系统
python -m build --help

# 测试安装
pip install -e .

# 验证元数据
pip show my-package

# 使用不同工具测试
uv init --from pyproject.toml
hatch new --init
pdm add --dev pytest
```

---

## 总结和建议

### 核心原则

1. **单一真实来源**：将所有配置保留在 `pyproject.toml` 中
2. **标准合规**：遵循 PEP 517/518/621 规范
3. **工具集成**：使用工具特定章节进行配置
4. **依赖管理**：分离运行时和开发依赖
5. **版本策略**：选择适当的版本管理方法
6. **构建隔离**：使用 PEP 517 兼容的构建后端
7. **文档**：维护全面的 README 和内联文档

### 最佳实践清单

- [ ] 使用带有显式要求的 `[build-system]`
- [ ] 包含所有必需的 `[project]` 字段
- [ ] 分离运行时和可选依赖
- [ ] 在 `[tool.*]` 章节中配置所有工具
- [ ] 使用语义版本控制（PEP 440）
- [ ] 包含全面的分类器
- [ ] 为 CLI 工具添加入口点
- [ ] 配置测试和 CI/CD 集成
- [ ] 发布前验证配置
- [ ] 保持依赖最小化和安全

### 工具选择指南

| 项目类型 | 推荐后端 | 工具 |
|--------------|-------------------|-------|
| **简单库** | flit | black, ruff, pytest |
| **复杂应用** | setuptools | mypy, sphinx, pre-commit |
| **现代开发** | hatch | uv, ruff, pytest |
| **企业级** | setuptools + 自定义 | 完整工具链 |
| **数据科学** | setuptools | numpy, pandas, jupyter |

### 资源和参考

#### 官方文档
- PEP 518: https://peps.python.org/pep-0518/
- PEP 517: https://peps.python.org/pep-0517/
- PEP 621: https://peps.python.org/pep-0621/
- PyPA 项目: https://www.pypa.io/en/latest/
- TOML 规范: https://toml.io/en/

#### 工具文档
- setuptools: https://setuptools.pypa.io/
- hatch: https://hatch.pypa.io/
- flit: https://flit.pypa.io/en/stable/
- pip: https://pip.pypa.io/en/stable/
- uv: https://docs.astral.sh/uv/

#### 社区资源
- Python 打包指南: https://packaging.python.org/
- PyPI: https://pypi.org/
- Python 论坛: https://discuss.python.org/
- Real Python: https://realpython.com/