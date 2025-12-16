# uv 完整指南：现代 Python 包管理

## 目录
1. [什么是 uv](#什么是-uv)
2. [为什么建议使用 uv](#为什么建议使用-uv)
3. [如何使用 uv 替换 pip](#如何使用-uv-替换-pip)
4. [现代用法和最佳实践](#现代用法和最佳实践)

---

## 什么是 uv

### 概述

uv 是一个极其快速的 Python 包和项目管理器，使用 Rust 编写。它为管理 Python 依赖、虚拟环境、Python 版本和项目提供了统一的接口。

### 核心架构

| 组件 | 语言 | 用途 | 替代 |
|------------|----------|---------|-----------|
| **包安装器** | Rust | 快速依赖解析和安装 | `pip` |
| **项目管理器** | Rust | 使用锁文件的现代项目管理 | `poetry`, `pip-tools` |
| **环境管理器** | Rust | 虚拟环境创建和管理 | `virtualenv`, `venv` |
| **Python 版本管理器** | Rust | 安装和切换 Python 版本 | `pyenv` |
| **工具运行器** | Rust | 从包中执行 CLI 工具 | `pipx` |
| **包发布器** | Rust | 构建和发布分发包 | `twine` |

### 主要特性

- **🚀 统一工具链**：单个命令替换 8+ 个 Python 工具
- **⚡️ 性能**：比 pip 快 10-100 倍（基准测试）
- **🗂️ 项目管理**：跨平台通用锁文件支持
- **❇️ 脚本支持**：运行带有内联依赖元数据的脚本
- **🐍 Python 管理**：安装和管理多个 Python 版本
- **🛠️ 工具执行**：运行和安装 Python CLI 工具
- **🔩 pip 兼容性**：pip 工作流的直接替换
- **🏢 工作区**：Cargo 风格的多包项目
- **💾 全局缓存**：节省磁盘空间的依赖去重

### 设计理念

- **零依赖**：uv 不需要预先安装 Python
- **跨平台**：原生支持 macOS、Linux、Windows
- **标准兼容**：遵循 PEP 517、PEP 518、PEP 621
- **向后兼容**：保持 pip 接口以便轻松迁移

---

## 为什么建议使用 uv

### 性能基准测试

| 操作 | pip 时间 | uv 时间 | 速度提升 |
|-----------|-----------|-----------|------------------|
| 安装 requests（冷缓存） | 1.2s | 0.08s | **15 倍更快** |
| 安装 Flask（热缓存） | 0.8s | 0.01s | **80 倍更快** |
| 解析 50 个包 | 2.5s | 0.03s | **83 倍更快** |
| 创建虚拟环境 | 0.5s | 0.02s | **25 倍更快** |
| 从 requirements.txt 安装 | 3.2s | 0.12s | **27 倍更快** |

### 统一工具链优势

**传统 Python 工作流**（需要 6+ 个工具）：
```bash
# 1. 安装 Python 版本
pyenv install 3.11.0
pyenv local 3.11.0

# 2. 创建虚拟环境
python -m venv .venv
source .venv/bin/activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 安装开发工具
pip install black flake8
pipx install ruff

# 5. 锁定依赖（pip-tools）
pip-compile requirements.in -o requirements.txt

# 6. 构建和发布
python -m build
twine upload dist/*
```

**现代 uv 工作流**（1 个工具）：
```bash
# 1. 使用 Python 版本初始化项目
uv init myproject --python 3.11.0

# 2. 安装所有依赖
uv add requests flask
uv add --dev black flake8

# 3. 安装全局工具
uv tool install ruff

# 4. 锁定依赖（自动）
uv lock

# 5. 构建和发布
uv build
uv publish
```

### 高级能力

| 功能 | 传统方法 | uv 方法 | 优势 |
|----------|-------------------|--------------|-----------|
| **依赖解析** | pip（慢，基础解析器） | uv（快，高级解析器） | 处理复杂冲突 |
| **跨平台锁** | pip-tools（平台特定） | uv（通用锁文件） | 单个锁文件处处可用 |
| **并行操作** | pip（顺序） | uv（并发） | 更快的下载和安装 |
| **缓存管理** | pip（每环境缓存） | uv（全局去重） | 磁盘空间效率 |
| **构建隔离** | pip（共享构建环境） | uv（隔离构建） | 可重现构建 |

### 可靠性和生态系统

- **Astral 支持**：Ruff 背后的团队（被 50 万+ 项目使用）
- **生产就绪**：在企业环境中经过实战检验
- **活跃开发**：每周发布，快速功能添加
- **开源**：MIT 许可证，Apache 2.0 核心
- **社区驱动**：75K+ GitHub 星标，活跃贡献

---

## 如何使用 uv 替换 pip

### 安装方法

| 方法 | 命令 | 平台 | 备注 |
|--------|----------|----------|--------|
| **独立安装（推荐）** | `curl -LsSf https://astral.sh/uv/install.sh | sh` | macOS, Linux | 自更新 |
| **独立安装** | `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` | Windows | 自更新 |
| **PyPI** | `pip install uv` | 任意 | 需要现有 Python |
| **Homebrew** | `brew install uv` | macOS | 包管理器 |
| **WinGet** | `winget install --id=astral-sh.uv -e` | Windows | 包管理器 |
| **Cargo** | `cargo install --locked uv` | 任意 | 从源码构建 |

### 精确的 pip 命令替换

#### 包安装命令

| pip 命令 | uv 等效命令 | 精确行为 |
|-------------|----------------|-----------------|
| `pip install package` | `uv pip install package` | 安装包到当前环境 |
| `pip install package==1.2.3` | `uv pip install 'package==1.2.3'` | 安装特定版本 |
| `pip install 'package>=1.0.0'` | `uv pip install 'package>=1.0.0'` | 使用版本约束安装 |
| `pip install package1 package2` | `uv pip install package1 package2` | 安装多个包 |
| `pip install -r requirements.txt` | `uv pip install -r requirements.txt` | 从需求文件安装 |
| `pip install -e .` | `uv pip install -e .` | 以可编辑模式安装当前目录 |
| `pip install git+https://github.com/user/repo` | `uv pip install "git+https://github.com/user/repo"` | 从 Git 仓库安装 |
| `pip install "package[extra]"` | `uv pip install "package[extra]"` | 安装可选依赖 |

#### 虚拟环境命令

| pip 命令 | uv 等效命令 | 精确行为 |
|-------------|----------------|-----------------|
| `python -m venv .venv` | `uv venv` | 在 `.venv` 创建虚拟环境 |
| `python -m venv myenv` | `uv venv myenv` | 创建自定义名称的虚拟环境 |
| `python -m venv --python 3.11 .venv` | `uv venv --python 3.11` | 使用特定 Python 版本创建 |
| `source .venv/bin/activate` | `source .venv/bin/activate` | 激活环境（相同脚本） |
| `.venv\Scripts\activate` | `.venv\Scripts\activate` | 在 Windows 上激活（相同脚本） |
| `deactivate` | `deactivate` | 停用环境（相同命令） |

#### 包管理命令

| pip 命令 | uv 等效命令 | 精确行为 |
|-------------|----------------|-----------------|
| `pip uninstall package` | `uv pip uninstall package` | 从环境中移除包 |
| `pip list` | `uv pip list` | 列出已安装的包 |
| `pip list --format json` | `uv pip list --format json` | 以 JSON 格式列出包 |
| `pip freeze` | `uv pip freeze` | 以需求格式输出已安装的包 |
| `pip show package` | `uv pip show package` | 显示包详情和元数据 |
| `pip check` | `uv pip check` | 检查依赖冲突 |
| `pip search package` | *(无直接等效命令)* | 改用 PyPI 网站 |

#### 需求编译命令

| pip-tools 命令 | uv 等效命令 | 精确行为 |
|------------------|----------------|-----------------|
| `pip-compile requirements.in` | `uv pip compile requirements.in` | 编译需求到锁文件 |
| `pip-compile requirements.in -o requirements.txt` | `uv pip compile requirements.in -o requirements.txt` | 将输出写入文件 |
| `pip-compile --upgrade-package package` | `uv pip compile --upgrade-package package` | 升级锁文件中的特定包 |
| `pip-compile --upgrade` | `uv pip compile --upgrade` | 升级所有包 |
| `pip-sync requirements.txt` | `uv pip sync requirements.txt` | 将环境与需求文件同步 |

#### 高级 pip 命令

| pip 命令 | uv 等效命令 | 精确行为 |
|-------------|----------------|-----------------|
| `pip install --user package` | `uv pip install --system package` | 安装到系统环境 |
| `pip install --no-deps package` | `uv pip install --no-deps package` | 不安装依赖地安装 |
| `pip install --index-url URL package` | `uv pip install --index-url URL package` | 使用自定义包索引 |
| `pip config list` | *(无直接等效命令)* | 使用 uv 配置设置 |
| `pip cache dir` | `uv cache dir` | 显示缓存目录路径 |
| `pip cache purge` | `uv cache clean` | 清理包缓存 |

### 迁移场景

#### 场景 1：在现有项目中替换 pip

```bash
# 之前：传统 pip 工作流
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pytest black

# 之后：uv 工作流（直接替换）
uv venv
source .venv/bin/activate  # 可选，uv 自动找到 .venv
uv pip install -r requirements.txt
uv pip install pytest black
```

#### 场景 2：从 pip-tools 迁移

```bash
# 之前：pip-tools 工作流
pip-compile requirements.in -o requirements.txt
pip-sync requirements.txt

# 之后：uv 工作流（精确替换）
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

#### 场景 3：现代项目方法

```bash
# 推荐：使用 uv 的项目管理
uv init myproject
cd myproject

# 添加依赖（自动更新 pyproject.toml 和 uv.lock）
uv add requests flask
uv add --dev pytest black

# 在托管环境中运行命令
uv run python -c "import requests; print(requests.__version__)"
uv run pytest
uv run black .
```

---

## 现代用法和最佳实践

### 项目管理工作流

#### 初始化和设置

| 命令 | 用途 | 何时使用 |
|----------|---------|-------------|
| `uv init project-name` | 创建新项目 | 开始新的 Python 项目 |
| `uv init` | 在当前目录初始化 | 转换现有目录 |
| `uv init --python 3.11` | 使用特定 Python 创建 | 版本特定项目 |
| `uv add package` | 添加运行时依赖 | 添加必需包 |
| `uv add --dev package` | 添加开发依赖 | 添加测试/检查工具 |
| `uv add -r requirements.txt` | 从 requirements.txt 导入 | 迁移现有项目 |

#### 项目结构

```
myproject/
├── .gitignore              # Git 忽略文件
├── .python-version          # Python 版本规范
├── pyproject.toml          # 项目元数据和依赖
├── uv.lock                 # 通用锁文件（提交到 VCS）
├── src/                    # 源代码
│   └── myproject/
│       └── __init__.py
├── tests/                   # 测试文件
│   └── test_main.py
└── README.md               # 项目文档
```

#### 依赖管理最佳实践

| 策略 | 命令 | 示例 |
|-----------|----------|----------|
| **语义约束** | `uv add 'package>=1.0.0,<2.0.0'` | `uv add 'requests>=2.28.0,<3.0.0'` |
| **兼容发布** | `uv add 'package~=1.4.0'` | `uv add 'numpy~=1.24.0'` (>=1.24.0,<1.25.0) |
| **分离开发依赖** | `uv add --dev pytest black` | 保持开发工具分离 |
| **可选依赖** | `uv add 'package[extra]'` | `uv add 'fastapi[all]'` |
| **Git 依赖** | `uv add "git+https://github.com/user/repo"` | 从开发分支安装 |

### 环境管理

#### Python 版本管理

| 命令 | 用途 | 示例 |
|----------|---------|----------|
| `uv python install 3.11 3.12` | 安装多个 Python 版本 | 安装 Python 3.11 和 3.12 |
| `uv python list` | 列出可用的 Python 版本 | 查看所有已安装版本 |
| `uv python pin 3.11` | 为项目固定 Python 版本 | 创建 `.python-version` 文件 |
| `uv venv --python 3.11` | 使用特定 Python 创建 venv | 为此环境使用 Python 3.11 |
| `uv run --python 3.12 script.py` | 使用特定 Python 运行 | 用 Python 3.12 执行脚本 |

#### 虚拟环境策略

```bash
# 1. 让 uv 自动管理环境（推荐）
uv run python script.py    # 自动创建和管理 .venv
uv run pytest          # 在项目环境中运行

# 2. 手动环境管理
uv venv                 # 创建 .venv
uv sync                  # 从锁文件安装依赖
source .venv/bin/activate  # 手动激活
python script.py          # 使用激活环境运行

# 3. 为不同目的使用多个环境
uv venv .venv-dev        # 开发环境
uv venv .venv-test       # 测试环境
uv sync --python .venv-dev # 安装到特定环境
```

### 脚本和工具管理

#### 脚本依赖

创建带有内联元数据的脚本：

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

运行脚本并自动解析依赖：

```bash
uv run script.py
# 输出：Reading inline script metadata from: script.py
# 输出：Installed 2 packages in 12ms
# 输出：GitHub API Status: 200
```

#### 全局工具安装

| 命令 | 用途 | 示例 |
|----------|---------|----------|
| `uv tool install ruff` | 安装全局 CLI 工具 | 全局安装 ruff 检查器 |
| `uv tool install black` | 安装代码格式化器 | 安装 black 格式化器 |
| `uv tool list` | 列出已安装工具 | 查看所有全局工具 |
| `uv tool uninstall ruff` | 移除全局工具 | 卸载 ruff |
| `uvx ruff` | 不安装运行工具 | 在临时环境中执行 ruff |

### 锁文件和依赖策略

#### 通用锁文件管理

```bash
# 从 pyproject.toml 创建锁文件
uv lock

# 更新锁文件中的特定包
uv lock --upgrade-package requests

# 将锁文件导出为 requirements.txt 以保持传统兼容性
uv pip compile pyproject.toml -o requirements.txt

# 创建平台特定需求
uv pip compile pyproject.toml --universal -o requirements.txt
```

#### 约束和覆盖文件

**constraints.txt**（附加边界）：
```
pydantic<2.0.0
requests>=2.28.0
```

**overrides.txt**（绝对替换）：
```
# 强制特定版本，尽管有传递冲突
cryptography>=42.0.0
```

用法：
```bash
uv pip compile requirements.in --constraint constraints.txt --override overrides.txt
```

### 性能优化

#### 缓存管理

| 命令 | 用途 | 何时使用 |
|----------|---------|-------------|
| `uv cache info` | 查看缓存统计 | 监控缓存使用情况 |
| `uv cache clean` | 清除所有缓存 | 解决缓存损坏 |
| `uv cache dir` | 显示缓存位置 | 调试缓存问题 |

#### 网络优化

```bash
# 使用替代索引以更快下载
uv add package --index-url https://pypi.doubanio.com/simple/

# 在 pyproject.toml 中配置以供项目范围使用
[tool.uv]
index-url = "https://pypi.doubanio.com/simple/"

# 使用多个索引
[tool.uv]
extra-index-url = [
    "https://download.pytorch.org/whl/cpu",
    "https://pypi.anaconda.org/scipy-wheels-nightly/simple"
]
```

### CI/CD 集成

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

#### Docker 集成

```dockerfile
FROM python:3.11-slim

# 安装 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# 复制项目文件
COPY pyproject.toml uv.lock ./
COPY src/ ./src/

# 安装依赖（冻结以保证可重现性）
RUN uv sync --frozen

# 运行应用程序
CMD ["uv", "run", "python", "-m", "myproject"]
```

### 常见问题故障排除

#### 依赖冲突

```bash
# 检查环境中的冲突
uv pip check

# 查看依赖树
uv tree

# 通过更新约束解决冲突
uv add 'package_a>=2.0.0' 'package_b>=1.5.0'

# 对顽固冲突使用覆盖
uv pip compile requirements.in --override overrides.txt
```

#### 缓存问题

```bash
# 清除损坏的缓存
uv cache clean

# 使用新鲜缓存重新同步
uv sync --refresh

# 检查缓存位置
uv cache dir
# 输出：/home/user/.cache/uv
```

#### 环境发现

```bash
# 检查 uv 将使用哪个环境
uv venv --help

# 强制特定环境
VIRTUAL_ENV=/path/to/custom/venv uv pip install package

# 使用系统 Python（不推荐用于开发）
uv pip install --system package
```

### 高级工作流

#### 使用工作区的 Monorepo

```toml
# pyproject.toml (根目录)
[project]
name = "my-monorepo"
version = "0.1.0"

[tool.uv.workspace]
members = ["packages/*", "tools/*"]

[tool.uv.sources]
my-local-package = { workspace = true }
```

#### 构建和发布

```bash
# 构建分发包（wheel 和 sdist）
uv build

# 构建特定格式
uv build --wheel      # 仅 wheel
uv build --sdist      # 仅源码分发包

# 发布到 PyPI
uv publish

# 发布到测试索引
uv publish --publish-url https://test.pypi.org/legacy/

# 使用特定 Python 版本构建
uv build --python 3.11
```

---

## 总结和建议

### 核心原则

1. **使用项目管理**：优先使用 `uv init`/`uv add` 而非手动 `uv pip` 命令
2. **提交锁文件**：始终将 `uv.lock` 提交到版本控制以保证可重现性
3. **分离关注点**：对开发工具使用 `--dev`，对生产环境使用运行时依赖
4. **利用缓存**：信任 uv 的全局缓存以获得性能和磁盘效率
5. **使用 uv run**：让 uv 自动管理环境以保证一致性
6. **固定 Python 版本**：使用 `.python-version` 以保证团队一致性
7. **优先使用通用锁文件**：使用 `uv.lock` 而非平台特定的 requirements.txt

### 迁移路径

| 阶段 | 方法 | 命令 |
|-------|-----------|----------|
| **初学者** | 直接 pip 替换 | `uv pip install`, `uv pip list`, `uv pip uninstall` |
| **中级** | 项目管理 | `uv init`, `uv add`, `uv run` |
| **高级** | 完整 uv 生态系统 | 工作区、自定义索引、CI/CD 集成 |

### 何时使用每种方法

| 场景 | 推荐方法 |
|-----------|-------------------|
| 快速脚本执行 | `uv run script.py` 配合内联元数据 |
| 现有 pip 项目 | `uv pip install -r requirements.txt` 用于逐步迁移 |
| 新 Python 项目 | `uv init && uv add package` 用于现代工作流 |
| 开发工具 | `uv tool install ruff` 用于全局 CLI 工具 |
| 生产部署 | `uv sync --frozen` 用于可重现构建 |
| 复杂 monorepo | `uv workspaces` 用于多包管理 |

---

## 资源和进阶

### 官方文档
- uv 官方文档：https://docs.astral.sh/uv/
- GitHub 仓库：https://github.com/astral-sh/uv
- PyPI 包：https://pypi.org/project/uv/
- 基准测试：https://github.com/astral-sh/uv/blob/main/BENCHMARKS.md

### 社区和支持
- Discord 社区：https://discord.gg/astral-sh
- GitHub 讨论：https://github.com/astral-sh/uv/discussions
- 问题跟踪：https://github.com/astral-sh/uv/issues

### 相关工具
- Ruff（同一团队）：https://github.com/astral-sh/ruff
- Astral（公司）：https://astral.sh/