#!/bin/bash

# LLM Router 文本分类项目训练和评估脚本

echo "=== LLM Router 文本分类 Pipeline ==="

# 设置环境变量 - 使用 HF-Mirror
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export HF_HUB_OFFLINE=0  # 强制在线模式
export TRANSFORMERS_CACHE=""  # 禁用缓存
export HF_HOME=""  # 禁用缓存
export HF_DATASETS_CACHE=""  # 禁用数据集缓存
export HF_ENDPOINT="https://hf-mirror.com"  # 使用 HF-Mirror

# 创建输出目录
mkdir -p outputs
mkdir -p mlruns

# 检查网络连接 - 测试多个镜像站点
echo "检查网络连接..."
mirror_urls=("https://hf-mirror.com" "https://huggingface.co")
network_ok=false

for url in "${mirror_urls[@]}"; do
    echo "测试连接: $url"
    if curl -s --connect-timeout 10 "$url" > /dev/null; then
        echo "✅ 可以连接到: $url"
        export HF_ENDPOINT="$url"
        network_ok=true
        break
    else
        echo "❌ 无法连接到: $url"
    fi
done

if [ "$network_ok" = false ]; then
    echo "❌ 无法连接到任何 HuggingFace 镜像站点，请检查网络连接"
    exit 1
fi

# 检查依赖
echo "检查依赖包..."
python -c "import transformers, mlflow, torch; print('✅ 所有依赖包已安装')" || {
    echo "❌ 缺少依赖包，正在安装..."
    if command -v uv &> /dev/null; then
        echo "使用 uv 安装依赖..."
        uv sync
    else
        echo "使用 pip 安装依赖..."
        pip install -r requirements.txt
    fi
}

# 检查数据文件
if [ ! -f "src/data/llm_router_dataset-synth/train.jsonl" ]; then
    echo "❌ 错误：找不到训练数据文件 src/data/llm_router_dataset-synth/train.jsonl"
    exit 1
fi

if [ ! -f "src/data/llm_router_dataset-synth/test.jsonl" ]; then
    echo "❌ 错误：找不到测试数据文件 src/data/llm_router_dataset-synth/test.jsonl"
    exit 1
fi

# 训练模型
echo "🚀 开始训练模型..."
python src/train.py \
    --data_path src/data/llm_router_dataset-synth/train.jsonl \
    --test_path src/data/llm_router_dataset-synth/test.jsonl \
    --model_name distilbert-base-uncased \
    --output_dir ./outputs \
    --epochs 1 \
    --batch_size 32 \
    --max_length 512 \
    --experiment_name llm-router-classification \
    --warmup_steps 500 \
    --learning_rate 2e-5 \
    --weight_decay 0.01 \
    --device auto

if [ $? -eq 0 ]; then
    echo "✅ 训练完成！"
else
    echo "❌ 训练失败，请检查错误信息"
    exit 1
fi

# 评估模型
echo "📊 开始评估模型..."
python src/evaluate.py \
    --data_path src/data/llm_router_dataset-synth/train.jsonl \
    --test_path src/data/llm_router_dataset-synth/test.jsonl \
    --model_name distilbert-base-uncased \
    --max_length 512 \
    --experiment_name llm-router-classification \
    --device auto

if [ $? -eq 0 ]; then
    echo "✅ 评估完成！"
else
    echo "❌ 评估失败，请检查错误信息"
fi

# 检查是否有训练好的模型
if [ -d "./outputs" ] && [ "$(ls -A ./outputs)" ]; then
    echo "🔮 开始批量预测..."
    python src/predict.py \
        --model_path ./outputs \
        --data_path src/data/llm_router_dataset-synth/test.jsonl \
        --output_path predictions.jsonl \
        --max_length 512 \
        --device auto
else
    echo "⚠️  警告：没有找到训练好的模型，跳过预测步骤"
fi

echo "🎉 Pipeline 完成！"
echo "📁 实验日志位置: ./mlruns/"
echo "📁 模型输出位置: ./outputs/"
echo "🌐 查看 MLflow UI: mlflow ui"
