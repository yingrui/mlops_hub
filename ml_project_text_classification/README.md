# LLM Router 文本分类项目

基于 HuggingFace Transformers 和 MLflow 的 LLM Router 文本分类项目，用于识别提示文本是否需要深度思考。

> 🚀 **项目已升级到 uv 依赖管理** - 更快的包安装和更好的环境管理！查看 [迁移指南](MIGRATION_GUIDE.md) 了解详情。

## 项目特点

- **工程化设计**: 模块化代码结构，易于扩展和维护
- **MLflow 集成**: 完整的实验追踪、模型管理和 pipeline 编排
- **HuggingFace Transformers**: 使用预训练模型进行文本分类
- **可扩展性**: 支持不同的模型架构和数据集格式
- **自动化 Pipeline**: 一键运行训练、评估、预测流程

## 项目结构

```
tw-mlops-demo-FastSlowRouter/
├── data/                           # 数据集目录
│   └── llm_router_dataset-synth/   # LLM Router 数据集
│       ├── train.jsonl            # 训练集
│       └── test.jsonl             # 测试集
├── src/                           # 源代码
│   ├── data/                      # 数据处理模块
│   │   ├── loader.py             # 数据加载和预处理
│   │   └── dataset.py            # 数据集类定义
│   ├── models/                    # 模型定义
│   │   └── text_classifier.py    # 文本分类模型封装
│   ├── utils/                     # 工具函数
│   │   ├── device.py             # 设备管理
│   │   ├── network.py            # 网络连接
│   │   └── metrics.py            # 评估指标
│   ├── train.py                  # 训练脚本
│   ├── evaluate.py               # 评估脚本
│   └── predict.py                # 推理脚本
├── tests/                         # 测试目录
│   ├── conftest.py               # pytest 配置
│   ├── test_data_loading.py      # 数据加载测试
│   ├── test_dataset.py           # 数据集类测试
│   ├── test_device_utils.py      # 设备工具测试
│   ├── test_network_utils.py     # 网络工具测试
│   ├── test_metrics_utils.py     # 评估指标测试
│   └── test_integration.py       # 集成测试
├── mlruns/                        # MLflow 实验记录
├── outputs/                       # 模型输出目录
├── pyproject.toml                # 项目配置和依赖管理
├── pytest.ini                   # pytest 配置
├── run.sh                        # 一键运行脚本
└── README.md                     # 项目说明
```

## 数据集

### LLM Router 数据集
JSONL 格式，每条记录包含：
- `id`: 唯一标识符
- `prompt`: 提示文本
- `label`: 标签（0表示使用小模型，1表示使用大模型）

### 数据集统计
- **训练集**: `train.jsonl` (15,306 条记录)
- **测试集**: `test.jsonl` (4,922 条记录)
- **标签分布**: 小模型(0) 8,633 条，大模型(1) 11,595 条

## 安装依赖

### 使用 uv（推荐）

首先安装 uv：
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

然后安装项目依赖：
```bash
uv sync
```

或者创建并激活虚拟环境：
```bash
uv venv
source .venv/bin/activate  # Linux/macOS
# 或
.venv\Scripts\activate     # Windows
uv pip install -e .
```

**重要**: 确保激活虚拟环境后再运行 Python 脚本！
```

### 使用 pip（传统方式）

```bash
pip install -r requirements.txt
```

## 使用方法

### 1. 一键运行完整 Pipeline

```bash
./run.sh
```

或者使用 Makefile：
```bash
make run
```

### 2. 单独运行各个模块

#### 训练模型
```bash
python src/train.py \
    --data_path data/llm_router_dataset-synth/train.jsonl \
    --test_path data/llm_router_dataset-synth/test.jsonl \
    --model_name huawei-noah/TinyBERT_General_4L_312D \
    --epochs 3 \
    --batch_size 128 \
    --max_length 512 \
    --device auto
```

#### 评估模型
```bash
python src/evaluate.py \
    --data_path data/0312_training_fast_slow_thinking.jsonl \
    --model_name huawei-noah/TinyBERT_General_4L_312D \
    --device auto
```

#### 单条预测
```bash
python src/predict.py \
    --model_path ./outputs \
    --single \
    --prompt "你的提示文本" \
    --device auto
```

#### 批量预测
```bash
python src/predict.py \
    --model_path ./outputs \
    --data_path data/llm_router_dataset-synth/test.jsonl \
    --output_path predictions.jsonl \
    --device auto
```

### 3. 查看 MLflow 实验记录

```bash
uv run mlflow ui
```

或者使用 Makefile：
```bash
make mlflow-ui
```

访问 http://localhost:5000 查看实验记录、参数、指标和模型。

## 使用 Makefile（推荐）

项目提供了 Makefile 来简化常用操作：

```bash
# 查看所有可用命令
make help

# 安装依赖
make install

# 安装开发依赖
make install-dev

# 运行完整 pipeline
make run

# 单独运行各个模块
make train
make evaluate
make predict

# 运行测试
make test              # 运行所有测试
make test-unit         # 运行单元测试
make test-integration  # 运行集成测试
make test-data         # 运行数据相关测试
make test-device       # 运行设备相关测试
make test-network      # 运行网络相关测试
make test-metrics      # 运行指标相关测试
make test-coverage     # 运行测试并生成覆盖率报告

# 代码质量
make format    # 格式化代码
make lint      # 代码检查
make test      # 运行测试

# 设备管理
make check-device   # 检查设备信息
make test-device    # 测试设备功能

# 清理缓存
make clean

# 启动 MLflow UI
make mlflow-ui
```

## 技术栈

- **深度学习**: PyTorch, Transformers
- **实验管理**: MLflow
- **数据处理**: Pandas, NumPy
- **评估指标**: Scikit-learn
- **模型**: huawei-noah/TinyBERT_General_4L_312D (可替换为其他预训练模型)

## 模型架构

- **输入**: 问题 + [SEP] + 推理步骤
- **模型**: huawei-noah/TinyBERT_General_4L_312D + 分类头
- **输出**: 二分类 (有错误/无错误)
- **评估指标**: Accuracy, F1, Precision, Recall

## 扩展性

### 支持新的模型
在 `src/models/text_classifier.py` 中添加新的模型类。

### 支持新的数据集格式
在 `src/data/loader.py` 中添加新的数据加载函数。

### 支持新的评估指标
在训练和评估脚本的 `compute_metrics` 函数中添加新指标。

## 参数说明

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--data_path` | `data/0312_training_fast_slow_thinking.jsonl` | 数据文件路径 |
| `--model_name` | `huawei-noah/TinyBERT_General_4L_312D` | 预训练模型名称 |
| `--epochs` | `3` | 训练轮数 |
| `--batch_size` | `8` | 批次大小 |
| `--max_length` | `512` | 最大序列长度 |
| `--learning_rate` | `2e-5` | 学习率 |
| `--test_size` | `0.2` | 测试集比例 |
| `--device` | `auto` | 设备选择 (auto/cpu/cuda/mps) |

## 设备配置

### 检查设备
```bash
# 使用 Makefile
make check-device

# 或直接运行
uv run python check_device.py
```

### 设备选择
- `--device auto`: 自动选择最佳设备（推荐）
- `--device cpu`: 强制使用 CPU
- `--device cuda`: 使用 NVIDIA GPU
- `--device mps`: 使用 Apple Silicon GPU (MPS)

## 注意事项

1. 确保有足够的 GPU 内存（建议 8GB+）
2. 大数据集训练时间较长，建议使用 GPU
3. MLflow 会自动记录所有实验参数和指标
4. 模型会自动保存到 `outputs/` 目录
5. **重要**: 确保激活虚拟环境后再运行 Python 脚本

## 故障排除

如果遇到问题，请查看 [故障排除指南](TROUBLESHOOTING.md) 获取详细解决方案。
