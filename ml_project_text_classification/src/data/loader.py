import pandas as pd
import json
from sklearn.model_selection import train_test_split
from typing import Tuple, List, Dict
import mlflow

def load_llm_router_data(train_path: str, test_path: str = None, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    加载LLM Router数据集。
    Args:
        train_path: 训练集文件路径
        test_path: 测试集文件路径（如果为None，则从训练集中分割）
        random_state: 随机种子
    Returns:
        train_df, test_df: 训练集和测试集DataFrame
    """
    # 只在 MLflow 运行中记录参数
    try:
        mlflow.log_param("train_path", train_path)
        mlflow.log_param("test_path", test_path)
        mlflow.log_param("random_state", random_state)
    except Exception:
        # 如果不在 MLflow 运行中，忽略参数记录
        pass
    
    # 加载训练集
    train_data = []
    with open(train_path, 'r', encoding='utf-8') as f:
        for line in f:
            train_data.append(json.loads(line.strip()))
    
    train_df = pd.DataFrame(train_data)
    train_df['input_text'] = train_df['prompt']
    
    try:
        mlflow.log_param("train_samples", len(train_df))
        mlflow.log_param("train_label_0_samples", (train_df['label'] == 0).sum())
        mlflow.log_param("train_label_1_samples", (train_df['label'] == 1).sum())
    except Exception:
        pass
    
    if test_path:
        # 加载测试集
        test_data = []
        with open(test_path, 'r', encoding='utf-8') as f:
            for line in f:
                test_data.append(json.loads(line.strip()))
        
        test_df = pd.DataFrame(test_data)
        test_df['input_text'] = test_df['prompt']
        
        try:
            mlflow.log_param("test_samples", len(test_df))
            mlflow.log_param("test_label_0_samples", (test_df['label'] == 0).sum())
            mlflow.log_param("test_label_1_samples", (test_df['label'] == 1).sum())
        except Exception:
            pass
    else:
        # 从训练集中分割测试集
        train_df, test_df = train_test_split(
            train_df, test_size=0.2, random_state=random_state, stratify=train_df['label']
        )
    
    return train_df, test_df
