import os
import mlflow
import mlflow.transformers
import mlflow.models
import pandas as pd
from transformers import TrainingArguments, Trainer
from src.data.loader import load_llm_router_data
from src.data.dataset import create_datasets_from_dataframes
from src.models.text_classifier import TextClassifier
from src.utils.device import get_device, print_device_info
from src.utils.network import check_network_connection, setup_hf_environment
from src.utils.metrics import compute_classification_metrics
import argparse

def main(args):
    # 设置环境
    setup_hf_environment()
    
    # 检查网络连接
    if not check_network_connection():
        raise Exception("❌ 无法连接到任何 HuggingFace 镜像站点，请检查网络连接")
    
    # 设置设备
    device = get_device(args.device)
    print_device_info(device)
    
    mlflow.set_experiment(args.experiment_name)
    with mlflow.start_run(run_name=f"train-{args.model_name}-{args.epochs}epochs"):
        print("📊 加载 LLM Router 数据...")
        
        # 加载数据
        if args.test_path:
            train_df, test_df = load_llm_router_data(args.data_path, args.test_path)
        else:
            train_df, test_df = load_llm_router_data(args.data_path)
        
        num_labels = 2  # 二分类：0 vs 1
        
        print(f"📈 训练集大小: {len(train_df)}")
        print(f"📉 测试集大小: {len(test_df)}")
        
        print(f"🤖 从 HuggingFace 镜像加载模型 {args.model_name}...")
        model = TextClassifier(args.model_name, num_labels, device=device)
        tokenizer = model.get_tokenizer()
        
        print("🔧 处理数据...")
        train_dataset, test_dataset = create_datasets_from_dataframes(
            train_df=train_df,
            test_df=test_df,
            tokenizer=tokenizer,
            max_length=args.max_length
        )
        
        print("⚙️  设置训练参数...")
        training_args = TrainingArguments(
            output_dir=args.output_dir,
            num_train_epochs=args.epochs,
            per_device_train_batch_size=args.batch_size,
            per_device_eval_batch_size=args.batch_size,
            eval_strategy="epoch",  # 新版本参数名
            save_strategy="epoch",
            logging_dir=os.path.join(args.output_dir, 'logs'),
            logging_steps=10,
            load_best_model_at_end=True,
            metric_for_best_model="f1",
            greater_is_better=True,
            warmup_steps=args.warmup_steps,
            learning_rate=args.learning_rate,
            weight_decay=args.weight_decay,
            no_cuda=(device.type == 'cpu'),  # 如果使用CPU，禁用CUDA
        )
        
        trainer = Trainer(
            model=model.get_model(),
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=test_dataset,
            compute_metrics=compute_classification_metrics,
        )
        
        mlflow.log_params(vars(args))
        
        # 添加有用的标签
        mlflow.set_tag("model_type", "transformer")
        mlflow.set_tag("task", "text-classification")
        mlflow.set_tag("framework", "transformers")
        mlflow.set_tag("num_labels", num_labels)
        
        print("🚀 开始训练...")
        trainer.train()
        print("📊 训练完成，开始评估...")
        metrics = trainer.evaluate()
        mlflow.log_metrics(metrics)
        
        # 保存模型到本地目录
        model_save_path = os.path.join(args.output_dir, "final_model")
        trainer.save_model(model_save_path)
        tokenizer.save_pretrained(model_save_path)
        
        # 使用MLFlow transformers记录模型，确保UI兼容性
        mlflow.transformers.log_model(
            transformers_model={
                "model": model.get_model(),
                "tokenizer": tokenizer
            },
            artifact_path="model",
            task="text-classification",
            registered_model_name=f"{args.experiment_name}-model",
            input_example="a simple or complex question",
            signature=mlflow.models.infer_signature(
                model_input="a simple or complex question",
                model_output=[{"label": "LABEL_1", "score": 0.8}]
            )
        )
        
        # 记录模型路径到MLflow作为备用
        mlflow.log_artifact(model_save_path, "model_files")
        
        print("✅ 训练完成！最终指标:", metrics)
        print(f"📁 模型已保存到: {model_save_path}")
        print(f"🔗 MLFlow模型已注册: {args.experiment_name}-model")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_path', type=str, default='data/llm_router_dataset-synth/train.jsonl')
    parser.add_argument('--model_name', type=str, default='distilbert-base-uncased')
    parser.add_argument('--output_dir', type=str, default='./outputs')
    parser.add_argument('--epochs', type=int, default=3)
    parser.add_argument('--batch_size', type=int, default=8)
    parser.add_argument('--max_length', type=int, default=512)

    parser.add_argument('--experiment_name', type=str, default='llm-router-classification')
    parser.add_argument('--warmup_steps', type=int, default=500)
    parser.add_argument('--learning_rate', type=float, default=2e-5)
    parser.add_argument('--weight_decay', type=float, default=0.01)
    parser.add_argument('--device', type=str, default='auto', 
                       choices=['auto', 'cpu', 'cuda', 'mps'],
                       help='设备选择: auto(自动), cpu, cuda, mps')
    parser.add_argument('--test_path', type=str, default=None,
                       help='测试集文件路径')
    args = parser.parse_args()
    main(args)


