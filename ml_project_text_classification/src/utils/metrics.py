"""
评估指标工具函数
"""

from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from typing import Dict, Any

def compute_classification_metrics(pred) -> Dict[str, float]:
    """
    计算分类任务的评估指标
    
    Args:
        pred: 预测结果对象，包含 label_ids 和 predictions
    
    Returns:
        Dict[str, float]: 评估指标字典
    """
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average='weighted'),
        "precision": precision_score(labels, preds, average='weighted'),
        "recall": recall_score(labels, preds, average='weighted')
    }

def print_metrics(metrics: Dict[str, Any], title: str = "评估指标") -> None:
    """
    打印评估指标
    
    Args:
        metrics: 评估指标字典
        title: 标题
    """
    print(f"\n📊 {title}")
    print("=" * 30)
    for metric_name, value in metrics.items():
        if isinstance(value, (int, float)):
            print(f"  {metric_name.capitalize()}: {value:.4f}")
        else:
            print(f"  {metric_name.capitalize()}: {value}")
