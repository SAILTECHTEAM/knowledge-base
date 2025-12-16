# pyproject.toml 完整指南：現代 Python 項目配置

## 目錄
1. [什麼是 pyproject.toml](#什麼是-pyprojecttoml)
2. [為什麼要使用 pyproject.toml](#為什麼要使用-pyprojecttoml)
3. [核心結構和章節](#核心結構和章節)
4. [高級配置和最佳實踐](#高級配置和最佳實踐)

---

## 什麼是 pyproject.toml

### 概述

`pyproject.toml` 是 Python 項目的標準化配置文件，由 PEP 518 定義並由後續 PEP 增強。它作為項目元數據、依賴項、構建配置和工具設置的單一真實來源。

### 歷史演進

| 年份 | PEP | 目的 | 影響 |
|------|-----|---------|--------|
| **2016** | PEP 518 | 引入 `pyproject.toml` 用於構建系統要求 | 替換 `setup.py` 進行基本構建配置 |
| **2016** | PEP 517 | 標準化構建前端 | 啟用隔離構建和可重現打包 |
| **2020** | PEP 621 | 標準化項目元數據 | 替換 `setup.cfg`/`setup.py` 進行項目信息 |
| **2021** | PEP 660 | 支持 PEP 517 構建的可編輯安裝 | 改進開發工作流 |
| **2022** | PEP 639 | 增強依賴規範 | 改進依賴元數據和解析 |

### 核心理念

- **聲明式配置**：描述要構建什麼，而不是如何構建
- **工具無關**：所有現代 Python 工具支持的標準格式
- **構建系統隔離**：將項目元數據與構建邏輯分離
- **可重現構建**：相同配置在不同環境中產生相同結果

---

## 為什麼要使用 pyproject.toml

### 傳統與現代配置對比

**傳統方法**（多個文件）：
```
setup.py          # 構建腳本（複雜，Python 代碼）
setup.cfg         # 配置（元數據有限）
requirements.txt  # 依賴項（無開發/生產分離）
MANIFEST.in       # 文件包含規則
tox.ini           # 測試配置
.flake8           # 代碼檢查配置
.black            # 格式化配置
```

**現代方法**（單一文件）：
```
pyproject.toml    # 所有配置集中在一個文件中
```

### 優勢概覽

| 方面 | 傳統 | 現代（pyproject.toml） | 優勢 |
|--------|-------------|-------------------------|-----------|
| **配置** | 多個文件，不同格式 | 單一 TOML 文件 | 統一配置管理 |
| **元數據** | setup.py 中的 Python 代碼 | 聲明式 TOML 章節 | 無代碼執行，更安全 |
| **依賴項** | requirements.txt（扁平） | 結構化分組 | 開發/生產分離，可選依賴 |
| **構建系統** | 隱式/setuptools | 顯式 PEP 517/518 | 可重現，工具無關 |
| **工具配置** | 分離的配置文件 | 集成章節 | 集中化設置 |
| **IDE 支持** | 解析有限 | 標準化格式 | 更好的 IDE 集成 |

### 工具生態系統兼容性

| 工具類別 | 支持 pyproject.toml 的工具 | 集成級別 |
|---------------|--------------------------------|------------------|
| **構建工具** | setuptools, hatch, flit, pdm, poetry | 原生支持 |
| **包管理器** | pip, uv, pip-tools, conda | 完全兼容 |
| **代碼檢查/格式化** | black, ruff, flake8, mypy, isort | 原生配置 |
| **測試** | pytest, tox, coverage, nox | 集成設置 |
| **文檔** | sphinx, mkdocs, pdoc | 配置章節 |
| **CI/CD** | GitHub Actions, GitLab CI, pre-commit | 標準解析 |

### 現實世界採用情況

- **PyPI**：95%+ 的新包使用 pyproject.toml（2024年）
- **企業**：大公司的標準（Google、Microsoft、Meta）
- **開源**：許多基金會的要求（Apache、Python 軟件基金會）
- **教育**：Python 課程和培訓營的教學標準

---

## 核心結構和章節

### 基本文件結構

```toml
# pyproject.toml - 完整示例結構

[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-awesome-package"
version = "1.0.0"
description = "包的簡要描述"
readme = "README.md"
license = {text = "MIT"}
authors = [
    {name = "張三", email = "zhangsan@example.com"}
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
  # 目錄
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

### 構建系統章節

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

| 構建後端 | 何時使用 | 特性 |
|---------------|-------------|----------|
| **setuptools** | 傳統項目，複雜構建 | 完整功能集，廣泛生態 |
| **hatch** | 現代項目，插件 | 快速，可擴展，優秀默認值 |
| **flit** | 簡單純 Python 包 | 最小配置，PyPI 發布 |
| **pdm** | Poetry 類工作流 | 依賴管理，虛擬環境 |
| **maturin** | Rust 擴展 | Rust-Python 互操作，PyO3 集成 |

#### 後端特定示例

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

### 項目章節（PEP 621）

#### 必需字段

| 字段 | 類型 | 描述 | 示例 |
|-------|------|-------------|---------|
| `name` | 字符串 | 包名（PyPI 兼容） | `"my-package"` |
| `version` | 字符串 | 版本字符串（PEP 440） | `"1.2.3"` |
| `requires-python` | 字符串 | 最低 Python 版本 | `">=3.8"` |

#### 推薦字段

| 字段 | 類型 | 目的 | 最佳實踐 |
|-------|------|---------|---------------|
| `description` | 字符串 | 簡短包描述 | 一句話，< 100 字符 |
| `readme` | 字符串或表格 | 長描述文件 | 使用 `"README.md"` |
| `license` | 字符串或表格 | 許可證信息 | 使用 `{text = "MIT"}` |
| `authors` | 表格數組 | 包作者 | 包含姓名和郵箱 |
| `keywords` | 字符串數組 | 搜索關鍵詞 | 5-10 個相關術語 |
| `classifiers` | 字符串數組 | PyPI 分類器 | 使用標準分類器 |

#### 版本管理策略

**靜態版本：**
```toml
[project]
version = "1.2.3"
```

**動態版本（SCM）：**
```toml
[project]
dynamic = ["version"]

[tool.setuptools_scm]
```

**基於文件的版本：**
```toml
[project]
dynamic = ["version"]

[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
```

### 依賴管理

#### 運行時依賴

```toml
[project]
dependencies = [
    # 精確版本
    "requests==2.31.0",
    
    # 最低版本
    "click>=8.0.0",
    
    # 兼容發布操作符
    "numpy~=1.24.0",  # >=1.24.0, <1.25.0
    
    # 版本範圍
    "pandas>=1.5.0,<3.0.0",
    
    # 帶額外功能
    "fastapi[all]>=0.100.0",
    
    # Git 依賴
    "my-lib @ git+https://github.com/user/my-lib.git@main",
    
    # 本地路徑
    "local-lib @ file://./libs/local-lib",
    
    # URL 依賴
    "package @ https://example.com/package-1.0.0.tar.gz",
]
```

#### 可選依賴（分組）

```toml
[project.optional-dependencies]
# 開發工具
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
    "pre-commit>=3.0.0",
]

# 文檔
docs = [
    "sphinx>=6.0.0",
    "sphinx-rtd-theme>=1.2.0",
    "myst-parser>=1.0.0",
]

# 測試
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

# 組合分組
all = [
    "my-package[dev,test,docs]",
]
```

#### 依賴規範模式

| 模式 | 語法 | 使用場景 |
|---------|--------|----------|
| **精確** | `package==1.2.3` | 關鍵安全補丁 |
| **最低** | `package>=1.2.3` | 向後兼容更新 |
| **兼容** | `package~=1.2.3` | 相同主/次版本 |
| **範圍** | `package>=1.2.3,<2.0.0` | 受控版本範圍 |
| **排除** | `package>=1.2.3,!=1.2.5` | 避免有問題的版本 |

### 入口點和腳本

#### 控制台腳本

```toml
[project.scripts]
# 簡單命令
my-cli = "my_package.cli:main"

# 帶參數的命令
my-tool = "my_package.tool:cli_main"

# 多個命令
server = "my_package.server:start"
client = "my_package.client:run"
worker = "my_package.worker:process"
```

#### GUI 腳本

```toml
[project.gui-scripts]
my-gui = "my_package.gui:main_app"
```

#### 其他入口點

```toml
[project.entry-points."my_plugin.category"]
plugin1 = "my_package.plugins:Plugin1"
plugin2 = "my_package.plugins:Plugin2"

[project.entry-points."pytest11"]
my_pytest_plugin = "my_package.testing:pytest_plugin"

[project.entry-points."console_scripts"]
# 腳本的替代語法
```

---

## 高級配置和最佳實踐

### 工具配置章節

#### 代碼格式化（Black）

```toml
[tool.black]
line-length = 88
target-version = ['py38', 'py39', 'py310']
include = '\.pyi?$'
extend-exclude = '''
/(
  # 目錄
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

# Black 特定選項
skip-string-normalization = false
skip-magic-trailing-comma = false
preview = true  # 啟用預覽功能
```

#### 代碼檢查和格式化（Ruff）

```toml
[tool.ruff]
line-length = 88
target-version = "py38"
select = [
    "E",      # pycodestyle 錯誤
    "W",      # pycodestyle 警告
    "F",      # pyflakes
    "I",      # isort
    "N",      # pep8-naming
    "B",      # flake8-bugbear
    "C90",    # mccabe
    "UP",     # pyupgrade
    "RUF",    # ruff 特定規則
]
ignore = [
    "E501",   # 行太長（由 black 處理）
    "B008",   # 不要在參數默認值中執行函數調用
    "RUF012", # 可變類默認值
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # 未使用的導入
"tests/*" = [
    "S101",   # 檢測到 assert 的使用
    "ARG001", # 未使用的函數參數
    "PLR2004", # 魔術值比較
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

#### 類型檢查（MyPy）

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

#### 測試（pytest）

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
    "slow: 標記慢速測試（使用 '-m \"not slow\"' 取消選擇）",
    "integration: 標記集成測試",
    "unit: 標記單元測試",
    "network: 標記需要網絡訪問的測試",
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

### 環境和構建配置

#### 環境特定設置

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

#### 構建自定義

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

### 文檔配置

#### Sphinx 配置

```toml
[tool.sphinx]
source-dir = "docs/source"
build-dir = "docs/build"
config-dir = "docs/source"

[tool.sphinx.config]
project = "My Package"
author = "張三"
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
      
      - name: 設置 Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ matrix.python-version }}
          
      - name: 安裝 uv
        uses: astral-sh/setup-uv@v3
        
      - name: 安裝依賴
        run: uv sync --all-extras --dev
        
      - name: 運行代碼檢查
        run: uv run ruff check src/
        
      - name: 運行類型檢查
        run: uv run mypy src/
        
      - name: 運行測試
        run: uv run pytest --cov=src/
        
      - name: 上傳覆蓋率
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

### 高級模式和技巧

#### 單倉庫配置

```toml
# 根目錄 pyproject.toml
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
    "package2 @ {root = packages/package2}",  # 工作區依賴
]

[tool.hatch.build.targets.wheel]
packages = ["src/package1"]
```

#### 條件依賴

```toml
[project.optional-dependencies]
# 平台特定依賴
windows = ["pywin32>=227"]
linux = ["python-systemd>=234"]
macos = ["pyobjc-framework-Cocoa>=8.0"]

# Python 版本特定
py38 = ["typing-extensions>=4.0.0"]
py39plus = ["zoneinfo>=0.2.1"]

# 功能特定
ml = ["scikit-learn>=1.0.0", "numpy>=1.20.0"]
web = ["fastapi>=0.100.0", "uvicorn>=0.20.0"]

# 條件組合
test = [
    "my-package[windows]" if sys_platform == "win32" else "my-package[linux]",
    "pytest>=7.0.0",
]
```

#### 動態配置

```toml
[tool.setuptools.dynamic]
version = {attr = "my_package.__version__"}
readme = {file = ["README.md"], content-type = "text/markdown"}
dependencies = {file = ["requirements.in"]}

[tool.setuptools.dynamic.optional-dependencies]
dev = {file = ["requirements-dev.in"]}
test = {file = ["requirements-test.in"]}

# 動態腳本
[tool.setuptools.dynamic.scripts]
my-cli = {cmd = "my_package.cli:main", scope = "console"}
```

### 遷移和最佳實踐

#### 從 setup.py 遷移

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

**之後（pyproject.toml）：**
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

#### 常見陷阱和解決方案

| 問題 | 原因 | 解決方案 |
|-------|-------|----------|
| **導入錯誤** | 缺少 `packages.find` 配置 | 添加 `[tool.setuptools.packages.find]` |
| **版本衝突** | 靜態版本與 SCM 工具衝突 | 使用 `dynamic = ["version"]` |
| **缺少數據文件** | 未包含 package-data | 配置 `[tool.setuptools.package-data]` |
| **構建失敗** | 不兼容的構建後端 | 更新 `build-system.requires` |
| **工具衝突** | 重疊的工具配置 | 使用工具特定章節 |

#### 驗證和測試

```bash
# 驗證 pyproject.toml 語法
python -c 'import tomllib; tomllib.load(open("pyproject.toml", "rb"))'

# 檢查構建系統
python -m build --help

# 測試安裝
pip install -e .

# 驗證元數據
pip show my-package

# 使用不同工具測試
uv init --from pyproject.toml
hatch new --init
pdm add --dev pytest
```

---

## 總結和建議

### 核心原則

1. **單一真實來源**：將所有配置保留在 `pyproject.toml` 中
2. **標準合規**：遵循 PEP 517/518/621 規範
3. **工具集成**：使用工具特定章節進行配置
4. **依賴管理**：分離運行時和開發依賴
5. **版本策略**：選擇適當的版本管理方法
6. **構建隔離**：使用 PEP 517 兼容的構建後端
7. **文檔**：維護全面的 README 和內聯文檔

### 最佳實踐清單

- [ ] 使用帶有顯式要求的 `[build-system]`
- [ ] 包含所有必需的 `[project]` 字段
- [ ] 分離運行時和可選依賴
- [ ] 在 `[tool.*]` 章節中配置所有工具
- [ ] 使用語義版本控制（PEP 440）
- [ ] 包含全面的分類器
- [ ] 為 CLI 工具添加入口點
- [ ] 配置測試和 CI/CD 集成
- [ ] 發布前驗證配置
- [ ] 保持依賴最小化和安全

### 工具選擇指南

| 項目類型 | 推薦後端 | 工具 |
|--------------|-------------------|-------|
| **簡單庫** | flit | black, ruff, pytest |
| **複雜應用** | setuptools | mypy, sphinx, pre-commit |
| **現代開發** | hatch | uv, ruff, pytest |
| **企業級** | setuptools + 自定義 | 完整工具鏈 |
| **數據科學** | setuptools | numpy, pandas, jupyter |

### 資源和參考

#### 官方文檔
- PEP 518: https://peps.python.org/pep-0518/
- PEP 517: https://peps.python.org/pep-0517/
- PEP 621: https://peps.python.org/pep-0621/
- PyPA 項目: https://www.pypa.io/en/latest/
- TOML 規範: https://toml.io/en/

#### 工作文檔
- setuptools: https://setuptools.pypa.io/
- hatch: https://hatch.pypa.io/
- flit: https://flit.pypa.io/en/stable/
- pip: https://pip.pypa.io/en/stable/
- uv: https://docs.astral.sh/uv/

#### 社區資源
- Python 打包指南: https://packaging.python.org/
- PyPI: https://pypi.org/
- Python 論壇: https://discuss.python.org/
- Real Python: https://realpython.com/