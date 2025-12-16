# uv 完整指南：現代 Python 套件管理

## 目錄
1. [什麼是 uv](#什麼是-uv)
2. [為什麼建議使用 uv](#為什麼建議使用-uv)
3. [如何使用 uv 替換 pip](#如何使用-uv-替換-pip)
4. [現代用法和最佳實踐](#現代用法和最佳實踐)

---

## 什麼是 uv

### 概述

uv 是一個極其快速的 Python 套件和專案管理器，使用 Rust 編寫。它為管理 Python 依賴、虛擬環境、Python 版本和專案提供了統一的介面。

### 核心架構

| 組件 | 語言 | 用途 | 替代 |
|------------|----------|---------|-----------|
| **套件安裝器** | Rust | 快速依賴解析和安裝 | `pip` |
| **專案管理器** | Rust | 使用鎖檔的現代專案管理 | `poetry`, `pip-tools` |
| **環境管理器** | Rust | 虛擬環境建立和管理 | `virtualenv`, `venv` |
| **Python 版本管理器** | Rust | 安裝和切換 Python 版本 | `pyenv` |
| **工具執行器** | Rust | 從套件中執行 CLI 工具 | `pipx` |
| **套件發布器** | Rust | 建構和發布分發套件 | `twine` |

### 主要特性

- **🚀 統一工具鏈**：單個指令替換 8+ 個 Python 工具
- **⚡️ 效能**：比 pip 快 10-100 倍（基準測試）
- **🗂️ 專案管理**：跨平台通用鎖檔支援
- **❇️ 腳本支援**：執行帶有內聯依賴元數據的腳本
- **🐍 Python 管理**：安裝和管理多個 Python 版本
- **🛠️ 工具執行**：執行和安裝 Python CLI 工具
- **🔩 pip 相容性**：pip 工作流的直接替換
- **🏢 工作區**：Cargo 風格的多套件專案
- **💾 全局快取**：節省磁碟空間的依賴去重

### 設計理念

- **零依賴**：uv 不需要預先安裝 Python
- **跨平台**：原生支援 macOS、Linux、Windows
- **標準相容**：遵循 PEP 517、PEP 518、PEP 621
- **向後相容**：保持 pip 介面以便輕鬆遷移

---

## 為什麼建議使用 uv

### 效能基準測試

| 操作 | pip 時間 | uv 時間 | 速度提升 |
|-----------|-----------|-----------|------------------|
| 安裝 requests（冷快取） | 1.2s | 0.08s | **15 倍更快** |
| 安裝 Flask（熱快取） | 0.8s | 0.01s | **80 倍更快** |
| 解析 50 個套件 | 2.5s | 0.03s | **83 倍更快** |
| 建立虛擬環境 | 0.5s | 0.02s | **25 倍更快** |
| 從 requirements.txt 安裝 | 3.2s | 0.12s | **27 倍更快** |

### 統一工具鏈優勢

**傳統 Python 工作流**（需要 6+ 個工具）：
```bash
# 1. 安裝 Python 版本
pyenv install 3.11.0
pyenv local 3.11.0

# 2. 建立虛擬環境
python -m venv .venv
source .venv/bin/activate

# 3. 安裝依賴
pip install -r requirements.txt

# 4. 安裝開發工具
pip install black flake8
pipx install ruff

# 5. 鎖定依賴（pip-tools）
pip-compile requirements.in -o requirements.txt

# 6. 建構和發布
python -m build
twine upload dist/*
```

**現代 uv 工作流**（1 個工具）：
```bash
# 1. 使用 Python 版本初始化專案
uv init myproject --python 3.11.0

# 2. 安裝所有依賴
uv add requests flask
uv add --dev black flake8

# 3. 安裝全域工具
uv tool install ruff

# 4. 鎖定依賴（自動）
uv lock

# 5. 建構和發布
uv build
uv publish
```

### 高級能力

| 功能 | 傳統方法 | uv 方法 | 優勢 |
|----------|-------------------|--------------|-----------|
| **依賴解析** | pip（慢，基礎解析器） | uv（快，高級解析器） | 處理複雜衝突 |
| **跨平台鎖** | pip-tools（平台特定） | uv（通用鎖檔） | 單個鎖檔處處可用 |
| **並行操作** | pip（順序） | uv（並發） | 更快的下載和安裝 |
| **快取管理** | pip（每環境快取） | uv（全域去重） | 磁碟空間效率 |
| **建構隔離** | pip（共享建構環境） | uv（隔離建構） | 可重現建構 |

### 可靠性和生態系統

- **Astral 支援**：Ruff 背後的團隊（被 50 萬+ 專案使用）
- **生產就緒**：在企業環境中經過實戰檢驗
- **活躍開發**：每週發布，快速功能添加
- **開源**：MIT 授權，Apache 2.0 核心
- **社群驅動**：75K+ GitHub 星標，活躍貢獻

---

## 如何使用 uv 替換 pip

### 安裝方法

| 方法 | 指令 | 平台 | 備註 |
|--------|----------|----------|--------|
| **獨立安裝（推薦）** | `curl -LsSf https://astral.sh/uv/install.sh | sh` | macOS, Linux | 自更新 |
| **獨立安裝** | `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` | Windows | 自更新 |
| **PyPI** | `pip install uv` | 任意 | 需要現有 Python |
| **Homebrew** | `brew install uv` | macOS | 套件管理器 |
| **WinGet** | `winget install --id=astral-sh.uv -e` | Windows | 套件管理器 |
| **Cargo** | `cargo install --locked uv` | 任意 | 從原始碼建構 |

### 精確的 pip 指令替換

#### 套件安裝指令

| pip 指令 | uv 等效指令 | 精確行為 |
|-------------|----------------|-----------------|
| `pip install package` | `uv pip install package` | 安裝套件到目前環境 |
| `pip install package==1.2.3` | `uv pip install 'package==1.2.3'` | 安裝特定版本 |
| `pip install 'package>=1.0.0'` | `uv pip install 'package>=1.0.0'` | 使用版本約束安裝 |
| `pip install package1 package2` | `uv pip install package1 package2` | 安裝多個套件 |
| `pip install -r requirements.txt` | `uv pip install -r requirements.txt` | 從需求檔案安裝 |
| `pip install -e .` | `uv pip install -e .` | 以可編輯模式安裝目前目錄 |
| `pip install git+https://github.com/user/repo` | `uv pip install "git+https://github.com/user/repo"` | 從 Git 倉庫安裝 |
| `pip install "package[extra]"` | `uv pip install "package[extra]"` | 安裝可選依賴 |

#### 虛擬環境指令

| pip 指令 | uv 等效指令 | 精確行為 |
|-------------|----------------|-----------------|
| `python -m venv .venv` | `uv venv` | 在 `.venv` 建立虛擬環境 |
| `python -m venv myenv` | `uv venv myenv` | 建立自訂名稱的虛擬環境 |
| `python -m venv --python 3.11 .venv` | `uv venv --python 3.11` | 使用特定 Python 版本建立 |
| `source .venv/bin/activate` | `source .venv/bin/activate` | 啟用環境（相同腳本） |
| `.venv\Scripts\activate` | `.venv\Scripts\activate` | 在 Windows 上啟用（相同腳本） |
| `deactivate` | `deactivate` | 停用環境（相同指令） |

#### 套件管理指令

| pip 指令 | uv 等效指令 | 精確行為 |
|-------------|----------------|-----------------|
| `pip uninstall package` | `uv pip uninstall package` | 從環境中移除套件 |
| `pip list` | `uv pip list` | 列出已安裝的套件 |
| `pip list --format json` | `uv pip list --format json` | 以 JSON 格式列出套件 |
| `pip freeze` | `uv pip freeze` | 以需求格式輸出已安裝的套件 |
| `pip show package` | `uv pip show package` | 顯示套件詳情和元數據 |
| `pip check` | `uv pip check` | 檢查依賴衝突 |
| `pip search package` | *(無直接等效指令)* | 改用 PyPI 網站 |

#### 需求編譯指令

| pip-tools 指令 | uv 等效指令 | 精確行為 |
|------------------|----------------|-----------------|
| `pip-compile requirements.in` | `uv pip compile requirements.in` | 編譯需求到鎖檔 |
| `pip-compile requirements.in -o requirements.txt` | `uv pip compile requirements.in -o requirements.txt` | 將輸出寫入檔案 |
| `pip-compile --upgrade-package package` | `uv pip compile --upgrade-package package` | 升級鎖檔中的特定套件 |
| `pip-compile --upgrade` | `uv pip compile --upgrade` | 升級所有套件 |
| `pip-sync requirements.txt` | `uv pip sync requirements.txt` | 將環境與需求檔案同步 |

#### 高級 pip 指令

| pip 指令 | uv 等效指令 | 精確行為 |
|-------------|----------------|-----------------|
| `pip install --user package` | `uv pip install --system package` | 安裝到系統環境 |
| `pip install --no-deps package` | `uv pip install --no-deps package` | 不安裝依賴地安裝 |
| `pip install --index-url URL package` | `uv pip install --index-url URL package` | 使用自訂套件索引 |
| `pip config list` | *(無直接等效指令)* | 使用 uv 配置設定 |
| `pip cache dir` | `uv cache dir` | 顯示快取目錄路徑 |
| `pip cache purge` | `uv cache clean` | 清理套件快取 |

### 遷移場景

#### 場景 1：在現有專案中替換 pip

```bash
# 之前：傳統 pip 工作流
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install pytest black

# 之後：uv 工作流（直接替換）
uv venv
source .venv/bin/activate  # 可選，uv 自動找到 .venv
uv pip install -r requirements.txt
uv pip install pytest black
```

#### 場景 2：從 pip-tools 遷移

```bash
# 之前：pip-tools 工作流
pip-compile requirements.in -o requirements.txt
pip-sync requirements.txt

# 之後：uv 工作流（精確替換）
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

#### 場景 3：現代專案方法

```bash
# 推薦：使用 uv 的專案管理
uv init myproject
cd myproject

# 新增依賴（自動更新 pyproject.toml 和 uv.lock）
uv add requests flask
uv add --dev pytest black

# 在託管環境中執行指令
uv run python -c "import requests; print(requests.__version__)"
uv run pytest
uv run black .
```

---

## 現代用法和最佳實踐

### 專案管理工作流

#### 初始化和設定

| 指令 | 用途 | 何時使用 |
|----------|---------|-------------|
| `uv init project-name` | 建立新專案 | 開始新的 Python 專案 |
| `uv init` | 在目前目錄初始化 | 轉換現有目錄 |
| `uv init --python 3.11` | 使用特定 Python 建立 | 版本特定專案 |
| `uv add package` | 新增執行時依賴 | 新增必需套件 |
| `uv add --dev package` | 新增開發依賴 | 新增測試/檢查工具 |
| `uv add -r requirements.txt` | 從 requirements.txt 匯入 | 遷移現有專案 |

#### 專案結構

```
myproject/
├── .gitignore              # Git 忽略檔案
├── .python-version          # Python 版本規範
├── pyproject.toml          # 專案元數據和依賴
├── uv.lock                 # 通用鎖檔（提交到 VCS）
├── src/                    # 原始碼
│   └── myproject/
│       └── __init__.py
├── tests/                   # 測試檔案
│   └── test_main.py
└── README.md               # 專案文件
```

#### 依賴管理最佳實踐

| 策略 | 指令 | 範例 |
|-----------|----------|----------|
| **語義約束** | `uv add 'package>=1.0.0,<2.0.0'` | `uv add 'requests>=2.28.0,<3.0.0'` |
| **相容發布** | `uv add 'package~=1.4.0'` | `uv add 'numpy~=1.24.0'` (>=1.24.0,<1.25.0) |
| **分離開發依賴** | `uv add --dev pytest black` | 保持開發工具分離 |
| **可選依賴** | `uv add 'package[extra]'` | `uv add 'fastapi[all]'` |
| **Git 依賴** | `uv add "git+https://github.com/user/repo"` | 從開發分支安裝 |

### 環境管理

#### Python 版本管理

| 指令 | 用途 | 範例 |
|----------|---------|----------|
| `uv python install 3.11 3.12` | 安裝多個 Python 版本 | 安裝 Python 3.11 和 3.12 |
| `uv python list` | 列出可用的 Python 版本 | 查看所有已安裝版本 |
| `uv python pin 3.11` | 為專案固定 Python 版本 | 建立 `.python-version` 檔案 |
| `uv venv --python 3.11` | 使用特定 Python 建立 venv | 為此環境使用 Python 3.11 |
| `uv run --python 3.12 script.py` | 使用特定 Python 執行 | 用 Python 3.12 執行腳本 |

#### 虛擬環境策略

```bash
# 1. 讓 uv 自動管理環境（推薦）
uv run python script.py    # 自動建立和管理 .venv
uv run pytest          # 在專案環境中執行

# 2. 手動環境管理
uv venv                 # 建立 .venv
uv sync                  # 從鎖檔安裝依賴
source .venv/bin/activate  # 手動啟用
python script.py          # 使用啟用環境執行

# 3. 為不同目的使用多個環境
uv venv .venv-dev        # 開發環境
uv venv .venv-test       # 測試環境
uv sync --python .venv-dev # 安裝到特定環境
```

### 腳本和工具管理

#### 腳本依賴

建立帶有內聯元數據的腳本：

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

執行腳本並自動解析依賴：

```bash
uv run script.py
# 輸出：Reading inline script metadata from: script.py
# 輸出：Installed 2 packages in 12ms
# 輸出：GitHub API Status: 200
```

#### 全域工具安裝

| 指令 | 用途 | 範例 |
|----------|---------|----------|
| `uv tool install ruff` | 安裝全域 CLI 工具 | 全域安裝 ruff 檢查器 |
| `uv tool install black` | 安裝程式碼格式化器 | 安裝 black 格式化器 |
| `uv tool list` | 列出已安裝工具 | 查看所有全域工具 |
| `uv tool uninstall ruff` | 移除全域工具 | 解除安裝 ruff |
| `uvx ruff` | 不安裝執行工具 | 在臨時環境中執行 ruff |

### 鎖檔和依賴策略

#### 通用鎖檔管理

```bash
# 從 pyproject.toml 建立鎖檔
uv lock

# 更新鎖檔中的特定套件
uv lock --upgrade-package requests

# 將鎖檔匯出為 requirements.txt 以保持傳統相容性
uv pip compile pyproject.toml -o requirements.txt

# 建立平台特定需求
uv pip compile pyproject.toml --universal -o requirements.txt
```

#### 約束和覆蓋檔案

**constraints.txt**（附加邊界）：
```
pydantic<2.0.0
requests>=2.28.0
```

**overrides.txt**（絕對替換）：
```
# 強制特定版本，儘管有傳遞衝突
cryptography>=42.0.0
```

用法：
```bash
uv pip compile requirements.in --constraint constraints.txt --override overrides.txt
```

### 效能優化

#### 快取管理

| 指令 | 用途 | 何時使用 |
|----------|---------|-------------|
| `uv cache info` | 查看快取統計 | 監控快取使用情況 |
| `uv cache clean` | 清除所有快取 | 解決快取損壞 |
| `uv cache dir` | 顯示快取位置 | 除錯快取問題 |

#### 網路優化

```bash
# 使用替代索引以更快下載
uv add package --index-url https://pypi.doubanio.com/simple/

# 在 pyproject.toml 中配置以供專案範圍使用
[tool.uv]
index-url = "https://pypi.doubanio.com/simple/"

# 使用多個索引
[tool.uv]
extra-index-url = [
    "https://download.pytorch.org/whl/cpu",
    "https://pypi.anaconda.org/scipy-wheels-nightly/simple"
]
```

### CI/CD 整合

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

#### Docker 整合

```dockerfile
FROM python:3.11-slim

# 安裝 uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# 複製專案檔案
COPY pyproject.toml uv.lock ./
COPY src/ ./src/

# 安裝依賴（凍結以保證可重現性）
RUN uv sync --frozen

# 執行應用程式
CMD ["uv", "run", "python", "-m", "myproject"]
```

### 常見問題故障排除

#### 依賴衝突

```bash
# 檢查環境中的衝突
uv pip check

# 查看依賴樹
uv tree

# 透過更新約束解決衝突
uv add 'package_a>=2.0.0' 'package_b>=1.5.0'

# 對頑固衝突使用覆蓋
uv pip compile requirements.in --override overrides.txt
```

#### 快取問題

```bash
# 清除損壞的快取
uv cache clean

# 使用新鮮快取重新同步
uv sync --refresh

# 檢查快取位置
uv cache dir
# 輸出：/home/user/.cache/uv
```

#### 環境發現

```bash
# 檢查 uv 將使用哪個環境
uv venv --help

# 強制特定環境
VIRTUAL_ENV=/path/to/custom/venv uv pip install package

# 使用系統 Python（不建議用於開發）
uv pip install --system package
```

### 高級工作流

#### 使用工作區的 Monorepo

```toml
# pyproject.toml (根目錄)
[project]
name = "my-monorepo"
version = "0.1.0"

[tool.uv.workspace]
members = ["packages/*", "tools/*"]

[tool.uv.sources]
my-local-package = { workspace = true }
```

#### 建構和發布

```bash
# 建構分發套件（wheel 和 sdist）
uv build

# 建構特定格式
uv build --wheel      # 僅 wheel
uv build --sdist      # 僅原始碼分發套件

# 發布到 PyPI
uv publish

# 發布到測試索引
uv publish --publish-url https://test.pypi.org/legacy/

# 使用特定 Python 版本建構
uv build --python 3.11
```

---

## 總結和建議

### 核心原則

1. **使用專案管理**：優先使用 `uv init`/`uv add` 而非手動 `uv pip` 指令
2. **提交鎖檔**：始終將 `uv.lock` 提交到版本控制以保證可重現性
3. **分離關注點**：對開發工具使用 `--dev`，對生產環境使用執行時依賴
4. **利用快取**：信任 uv 的全域快取以獲得效能和磁碟效率
5. **使用 uv run**：讓 uv 自動管理環境以保證一致性
6. **固定 Python 版本**：使用 `.python-version` 以保證團隊一致性
7. **優先使用通用鎖檔**：使用 `uv.lock` 而非平台特定的 requirements.txt

### 遷移路徑

| 階段 | 方法 | 指令 |
|-------|-----------|----------|
| **初學者** | 直接 pip 替換 | `uv pip install`, `uv pip list`, `uv pip uninstall` |
| **中級** | 專案管理 | `uv init`, `uv add`, `uv run` |
| **高級** | 完整 uv 生態系統 | 工作區、自訂索引、CI/CD 整合 |

### 何時使用每種方法

| 場景 | 推薦方法 |
|-----------|-------------------|
| 快速腳本執行 | `uv run script.py` 配合內聯元數據 |
| 現有 pip 專案 | `uv pip install -r requirements.txt` 用於逐步遷移 |
| 新 Python 專案 | `uv init && uv add package` 用於現代工作流 |
| 開發工具 | `uv tool install ruff` 用於全域 CLI 工具 |
| 生產部署 | `uv sync --frozen` 用於可重現建構 |
| 複雜 monorepo | `uv workspaces` 用於多套件管理 |

---

## 資源和進階

### 官方文件
- uv 官方文件：https://docs.astral.sh/uv/
- GitHub 倉庫：https://github.com/astral-sh/uv
- PyPI 套件：https://pypi.org/project/uv/
- 基準測試：https://github.com/astral-sh/uv/blob/main/BENCHMARKS.md

### 社群和支援
- Discord 社群：https://discord.gg/astral-sh
- GitHub 討論：https://github.com/astral-sh/uv/discussions
- 問題追蹤：https://github.com/astral-sh/uv/issues

### 相關工具
- Ruff（同一團隊）：https://github.com/astral-sh/ruff
- Astral（公司）：https://astral.sh/