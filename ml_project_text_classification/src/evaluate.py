import mlflow
import pandas as pd
from transformers import Trainer
from src.data.loader import load_llm_router_data
from src.data.dataset import create_test_dataset
from src.models.text_classifier import TextClassifier
from src.utils.device import get_device, print_device_info
from src.utils.network import setup_hf_environment
from src.utils.metrics import compute_classification_metrics
import argparse

def main(args):
    # 设置环境
    setup_hf_environment()
    
    # 设置设备
    device = get_device(args.device)
    print_device_info(device)
    
    mlflow.set_experiment(args.experiment_name)
    with mlflow.start_run():
        print("📊 加载 LLM Router 数据...")
        
        # 加载数据
        if args.test_path:
            _, test_df = load_llm_router_data(args.data_path, args.test_path)
        else:
            _, test_df = load_llm_router_data(args.data_path)
        
        num_labels = 2  # 二分类：0 vs 1
        
        model = TextClassifier(args.model_name, num_labels, device=device)
        tokenizer = model.get_tokenizer()
        
        # 创建测试数据集
        test_dataset = create_test_dataset(
            test_df=test_df,
            tokenizer=tokenizer,
            max_length=args.max_length
        )
        trainer = Trainer(
            model=model.get_model(),
            eval_dataset=test_dataset,
            compute_metrics=compute_classification_metrics,
        )
        metrics = trainer.evaluate()
        mlflow.log_metrics(metrics)
        print("Evaluation complete. Metrics:", metrics)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--data_path', type=str, default='data/llm_router_dataset-synth/train.jsonl')
    parser.add_argument('--model_name', type=str, default='distilbert-base-uncased')
    parser.add_argument('--max_length', type=int, default=512)

    parser.add_argument('--experiment_name', type=str, default='llm-router-classification')
    parser.add_argument('--device', type=str, default='auto', 
                       choices=['auto', 'cpu', 'cuda', 'mps'],
                       help='设备选择: auto(自动), cpu, cuda, mps')
    parser.add_argument('--test_path', type=str, default=None,
                       help='测试集文件路径')
    args = parser.parse_args()
    main(args)


