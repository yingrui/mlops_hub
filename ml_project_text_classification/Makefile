.PHONY: help install install-dev clean test test-unit test-integration test-data test-device test-network test-metrics test-coverage lint format run train evaluate predict check-device test-device

help: ## 显示帮助信息
	@echo "可用的命令："
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## 安装项目依赖
	uv sync

install-dev: ## 安装开发依赖
	uv sync --extra dev

install-virtualenv: ## 安装virtualenv
	uv add virtualenv

clean: ## 清理缓存和临时文件
	rm -rf __pycache__/
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

test: ## 运行测试
	uv run pytest

lint: ## 运行代码检查
	uv run flake8 src/
	uv run mypy src/

format: ## 格式化代码
	uv run black src/
	uv run isort src/

run: ## 运行完整的 pipeline
	./run.sh

train: ## 训练模型
	uv run python src/train.py \
		--data_path data/llm_router_dataset-synth/train.jsonl \
		--test_path data/llm_router_dataset-synth/test.jsonl \
		--model_name distilbert-base-uncased \
		--output_dir ./outputs \
		--epochs 3 \
		--batch_size 8 \
		--max_length 512 \
		--experiment_name llm-router-classification \
		--warmup_steps 500 \
		--learning_rate 2e-5 \
		--weight_decay 0.01 \
		--device auto

evaluate: ## 评估模型
	uv run python src/evaluate.py \
		--data_path data/llm_router_dataset-synth/train.jsonl \
		--test_path data/llm_router_dataset-synth/test.jsonl \
		--model_name distilbert-base-uncased \
		--max_length 512 \
		--experiment_name llm-router-classification \
		--device auto

predict: ## 批量预测
	uv run python src/predict.py \
		--model_path ./outputs \
		--data_path data/llm_router_dataset-synth/test.jsonl \
		--output_path predictions.jsonl \
		--max_length 512 \
		--device auto

mlflow-ui: ## 启动 MLflow UI
	uv run mlflow ui

deploy-model: ## 部署模型服务
	uv run mlflow models serve \
		--model-uri models:/llm-router-classification-model/latest \
		--port 8080 \
		--host 0.0.0.0

test-deployment: ## 测试模型部署
	uv run python scripts/test_deployment.py

predict-interactive: ## 交互式预测
	uv run python scripts/predict_with_labels.py --interactive

predict-batch: ## 批量预测
	uv run python scripts/predict_with_labels.py --batch

predict: ## 预测单个文本
	@echo "用法: make predict TEXT='your text here'"
	@if [ -n "$(TEXT)" ]; then \
		uv run python scripts/predict_with_labels.py "$(TEXT)"; \
	else \
		uv run python scripts/predict_with_labels.py; \
	fi

list-models: ## 列出已注册的模型
	uv run mlflow models list

show-model: ## 显示模型详情
	uv run mlflow models show llm-router-classification-model

check-device: ## 检查设备信息
	uv run python check_device.py

test-device: ## 测试设备功能
	uv run python test_device.py --device auto

test: ## 运行所有测试
	uv run pytest tests/ -v

test-unit: ## 运行单元测试
	uv run pytest tests/ -m "not integration" -v

test-integration: ## 运行集成测试
	uv run pytest tests/ -m integration -v

test-data: ## 运行数据相关测试
	uv run pytest tests/ -m data -v

test-device: ## 运行设备相关测试
	uv run pytest tests/ -m device -v

test-network: ## 运行网络相关测试
	uv run pytest tests/ -m network -v

test-metrics: ## 运行指标相关测试
	uv run pytest tests/ -m metrics -v

test-coverage: ## 运行测试并生成覆盖率报告
	uv run pytest tests/ --cov=src --cov-report=html --cov-report=term-missing -v

venv: ## 创建虚拟环境
	uv venv
	@echo "虚拟环境已创建！"
	@echo ""
	@echo "激活虚拟环境："
	@echo "source .venv/bin/activate  # Linux/macOS"
	@echo ".venv\\Scripts\\activate     # Windows"
	@echo ""
	@echo "激活后安装依赖："
	@echo "uv pip install -e ."
