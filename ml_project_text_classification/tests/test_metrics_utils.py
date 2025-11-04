"""
评估指标工具函数测试
"""

import pytest
import numpy as np
from src.utils.metrics import compute_classification_metrics, print_metrics


class TestMetricsUtils:
    """评估指标工具测试类"""
    
    def test_compute_classification_metrics_perfect_predictions(self):
        """测试完美预测的指标计算"""
        # 创建模拟预测结果对象
        class MockPred:
            def __init__(self):
                self.label_ids = np.array([0, 1, 0, 1, 0])
                self.predictions = np.array([
                    [0.9, 0.1],  # 预测为0，正确
                    [0.1, 0.9],  # 预测为1，正确
                    [0.8, 0.2],  # 预测为0，正确
                    [0.2, 0.8],  # 预测为1，正确
                    [0.7, 0.3]   # 预测为0，正确
                ])
        
        mock_pred = MockPred()
        metrics = compute_classification_metrics(mock_pred)
        
        # 验证返回的是字典
        assert isinstance(metrics, dict)
        
        # 验证必要的键存在
        required_keys = ['accuracy', 'f1', 'precision', 'recall']
        for key in required_keys:
            assert key in metrics
        
        # 验证完美预测的指标
        assert metrics['accuracy'] == 1.0
        assert metrics['f1'] == 1.0
        assert metrics['precision'] == 1.0
        assert metrics['recall'] == 1.0
    
    def test_compute_classification_metrics_all_wrong(self):
        """测试全部预测错误的指标计算"""
        class MockPred:
            def __init__(self):
                self.label_ids = np.array([0, 1, 0, 1, 0])
                self.predictions = np.array([
                    [0.1, 0.9],  # 预测为1，错误
                    [0.9, 0.1],  # 预测为0，错误
                    [0.1, 0.9],  # 预测为1，错误
                    [0.9, 0.1],  # 预测为0，错误
                    [0.1, 0.9]   # 预测为1，错误
                ])
        
        mock_pred = MockPred()
        metrics = compute_classification_metrics(mock_pred)
        
        # 验证全部错误的指标
        assert metrics['accuracy'] == 0.0
        assert metrics['f1'] == 0.0
        assert metrics['precision'] == 0.0
        assert metrics['recall'] == 0.0
    
    def test_compute_classification_metrics_mixed_predictions(self):
        """测试混合预测结果的指标计算"""
        class MockPred:
            def __init__(self):
                self.label_ids = np.array([0, 1, 0, 1, 0])
                self.predictions = np.array([
                    [0.9, 0.1],  # 预测为0，正确
                    [0.1, 0.9],  # 预测为1，正确
                    [0.1, 0.9],  # 预测为1，错误
                    [0.9, 0.1],  # 预测为0，错误
                    [0.7, 0.3]   # 预测为0，正确
                ])
        
        mock_pred = MockPred()
        metrics = compute_classification_metrics(mock_pred)
        
        # 验证指标值在合理范围内
        assert 0.0 <= metrics['accuracy'] <= 1.0
        assert 0.0 <= metrics['f1'] <= 1.0
        assert 0.0 <= metrics['precision'] <= 1.0
        assert 0.0 <= metrics['recall'] <= 1.0
        
        # 验证准确率（3/5 = 0.6）
        assert abs(metrics['accuracy'] - 0.6) < 0.01
    
    def test_compute_classification_metrics_single_class(self):
        """测试单一类别的指标计算"""
        class MockPred:
            def __init__(self):
                self.label_ids = np.array([0, 0, 0, 0, 0])
                self.predictions = np.array([
                    [0.9, 0.1],  # 预测为0
                    [0.8, 0.2],  # 预测为0
                    [0.7, 0.3],  # 预测为0
                    [0.6, 0.4],  # 预测为0
                    [0.5, 0.5]   # 预测为0
                ])
        
        mock_pred = MockPred()
        metrics = compute_classification_metrics(mock_pred)
        
        # 验证指标值在合理范围内
        assert 0.0 <= metrics['accuracy'] <= 1.0
        assert 0.0 <= metrics['f1'] <= 1.0
        assert 0.0 <= metrics['precision'] <= 1.0
        assert 0.0 <= metrics['recall'] <= 1.0
    
    def test_compute_classification_metrics_empty_data(self):
        """测试空数据的指标计算"""
        class MockPred:
            def __init__(self):
                self.label_ids = np.array([])
                self.predictions = np.array([])
        
        mock_pred = MockPred()
        
        # 空数据应该抛出异常
        with pytest.raises(Exception):
            compute_classification_metrics(mock_pred)
    
    def test_compute_classification_metrics_mismatched_lengths(self):
        """测试长度不匹配的数据"""
        class MockPred:
            def __init__(self):
                self.label_ids = np.array([0, 1, 0])
                self.predictions = np.array([
                    [0.9, 0.1],
                    [0.1, 0.9]
                ])
        
        mock_pred = MockPred()
        
        # 长度不匹配应该抛出异常
        with pytest.raises(Exception):
            compute_classification_metrics(mock_pred)
    
    def test_print_metrics(self, capsys):
        """测试指标打印功能"""
        metrics = {
            'accuracy': 0.85,
            'f1': 0.82,
            'precision': 0.88,
            'recall': 0.76
        }
        
        print_metrics(metrics, "测试评估结果")
        
        # 捕获输出并验证
        captured = capsys.readouterr()
        output = captured.out
        
        # 验证输出包含标题
        assert "测试评估结果" in output
        assert "=" in output
        
        # 验证输出包含所有指标
        assert "Accuracy: 0.8500" in output
        assert "F1: 0.8200" in output
        assert "Precision: 0.8800" in output
        assert "Recall: 0.7600" in output
    
    def test_print_metrics_default_title(self, capsys):
        """测试默认标题的指标打印"""
        metrics = {
            'accuracy': 0.75,
            'f1': 0.70
        }
        
        print_metrics(metrics)
        
        # 捕获输出并验证
        captured = capsys.readouterr()
        output = captured.out
        
        # 验证输出包含默认标题
        assert "评估指标" in output
        assert "Accuracy: 0.7500" in output
        assert "F1: 0.7000" in output
    
    def test_print_metrics_empty_dict(self, capsys):
        """测试空字典的指标打印"""
        metrics = {}
        
        print_metrics(metrics, "空指标")
        
        # 捕获输出并验证
        captured = capsys.readouterr()
        output = captured.out
        
        # 验证输出包含标题但不包含指标
        assert "空指标" in output
        assert "=" in output
    
    def test_print_metrics_non_numeric_values(self, capsys):
        """测试非数值指标的打印"""
        metrics = {
            'accuracy': 'N/A',
            'f1': 'invalid'
        }
        
        print_metrics(metrics, "非数值指标")
        
        # 捕获输出并验证
        captured = capsys.readouterr()
        output = captured.out
        
        # 验证输出包含指标名称
        assert "Accuracy:" in output
        assert "F1:" in output
