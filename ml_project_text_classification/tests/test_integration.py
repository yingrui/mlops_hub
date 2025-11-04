"""
集成测试模块
"""

import pytest
import pandas as pd
from src.data.loader import load_llm_router_data
from src.utils.device import get_device, get_device_recommendations
from src.utils.network import setup_hf_environment
from src.utils.metrics import compute_classification_metrics


class TestIntegration:
    """集成测试类"""
    
    def test_data_loading_integration(self):
        """测试数据加载的集成功能"""
        # 测试数据加载
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl",
            "data/llm_router_dataset-synth/test.jsonl"
        )
        
        # 验证数据完整性
        assert len(train_df) > 0
        assert len(test_df) > 0
        
        # 验证数据格式
        required_columns = ['id', 'prompt', 'label', 'input_text']
        for col in required_columns:
            assert col in train_df.columns
            assert col in test_df.columns
        
        # 验证数据一致性
        assert (train_df['input_text'] == train_df['prompt']).all()
        assert (test_df['input_text'] == test_df['prompt']).all()
    
    def test_device_utils_integration(self):
        """测试设备工具的集成功能"""
        # 测试设备获取
        device = get_device('auto')
        assert device.type in ['cpu', 'cuda', 'mps']
        
        # 测试设备推荐
        recommendations = get_device_recommendations()
        assert isinstance(recommendations, dict)
        assert 'batch_size' in recommendations
        assert 'max_length' in recommendations
        assert 'description' in recommendations
        
        # 验证推荐与设备类型一致
        if device.type == 'cuda':
            assert 'GPU' in recommendations['description']
        elif device.type == 'mps':
            assert 'Apple Silicon' in recommendations['description']
        else:
            assert 'CPU' in recommendations['description']
    
    def test_environment_setup_integration(self):
        """测试环境设置的集成功能"""
        # 保存原始环境变量
        import os
        original_env = {}
        for key in ['HF_HUB_OFFLINE', 'TRANSFORMERS_CACHE', 'HF_HOME', 'HF_DATASETS_CACHE', 'HF_ENDPOINT']:
            original_env[key] = os.environ.get(key)
        
        try:
            # 设置环境
            setup_hf_environment()
            
            # 验证环境变量设置
            assert os.environ['HF_HUB_OFFLINE'] == '0'
            assert os.environ['TRANSFORMERS_CACHE'] == ''
            assert os.environ['HF_HOME'] == ''
            assert os.environ['HF_DATASETS_CACHE'] == ''
            assert os.environ['HF_ENDPOINT'] == 'https://hf-mirror.com'
        
        finally:
            # 恢复原始环境变量
            for key, value in original_env.items():
                if value is not None:
                    os.environ[key] = value
                elif key in os.environ:
                    del os.environ[key]
    
    def test_metrics_computation_integration(self):
        """测试指标计算的集成功能"""
        # 创建模拟预测结果
        class MockPred:
            def __init__(self):
                import numpy as np
                self.label_ids = np.array([0, 1, 0, 1, 0])
                self.predictions = np.array([
                    [0.8, 0.2],  # 预测为0
                    [0.3, 0.7],  # 预测为1
                    [0.9, 0.1],  # 预测为0
                    [0.2, 0.8],  # 预测为1
                    [0.7, 0.3]   # 预测为0
                ])
        
        mock_pred = MockPred()
        metrics = compute_classification_metrics(mock_pred)
        
        # 验证指标计算
        assert isinstance(metrics, dict)
        assert 'accuracy' in metrics
        assert 'f1' in metrics
        assert 'precision' in metrics
        assert 'recall' in metrics
        
        # 验证指标值在合理范围内
        for metric_name, value in metrics.items():
            assert 0.0 <= value <= 1.0
    
    def test_end_to_end_data_flow(self):
        """测试端到端数据流"""
        # 1. 加载数据
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl",
            "data/llm_router_dataset-synth/test.jsonl"
        )
        
        # 2. 验证数据格式
        assert len(train_df) > 0
        assert len(test_df) > 0
        
        # 3. 获取设备信息
        device = get_device('auto')
        recommendations = get_device_recommendations()
        
        # 4. 验证设备推荐合理性
        assert recommendations['batch_size'] != ""
        assert recommendations['max_length'] != ""
        
        # 5. 模拟预测结果计算
        class MockPred:
            def __init__(self, labels):
                import numpy as np
                self.label_ids = np.array(labels)
                # 创建一些模拟预测结果
                self.predictions = np.random.rand(len(labels), 2)
                # 归一化
                self.predictions = self.predictions / self.predictions.sum(axis=1, keepdims=True)
        
        # 使用测试集的标签创建模拟预测
        test_labels = test_df['label'].tolist()[:10]  # 取前10个样本
        mock_pred = MockPred(test_labels)
        metrics = compute_classification_metrics(mock_pred)
        
        # 6. 验证整个流程
        assert isinstance(metrics, dict)
        assert all(key in metrics for key in ['accuracy', 'f1', 'precision', 'recall'])
        assert all(0.0 <= value <= 1.0 for value in metrics.values())
    
    def test_error_handling_integration(self):
        """测试错误处理的集成功能"""
        # 测试无效设备参数
        with pytest.raises(RuntimeError):
            get_device('invalid_device')
        
        # 测试空数据的指标计算
        class MockPred:
            def __init__(self):
                import numpy as np
                self.label_ids = np.array([])
                self.predictions = np.array([])
        
        mock_pred = MockPred()
        with pytest.raises(Exception):
            compute_classification_metrics(mock_pred)
    
    def test_data_statistics_integration(self):
        """测试数据统计的集成功能"""
        # 加载数据
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl",
            "data/llm_router_dataset-synth/test.jsonl"
        )
        
        # 验证数据统计
        train_stats = train_df['label'].value_counts()
        test_stats = test_df['label'].value_counts()
        
        # 验证标签分布
        assert len(train_stats) >= 1
        assert len(test_stats) >= 1
        
        # 验证标签值
        assert set(train_stats.index).issubset({0, 1})
        assert set(test_stats.index).issubset({0, 1})
        
        # 验证数据完整性
        assert train_stats.sum() == len(train_df)
        assert test_stats.sum() == len(test_df)
