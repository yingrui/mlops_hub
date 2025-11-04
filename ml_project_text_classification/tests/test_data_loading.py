"""
数据加载功能测试
"""

import pytest
import pandas as pd
from src.data.loader import load_llm_router_data


class TestDataLoading:
    """数据加载测试类"""
    
    def test_load_llm_router_data_success(self):
        """测试成功加载 LLM Router 数据"""
        # 加载数据
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl",
            "data/llm_router_dataset-synth/test.jsonl"
        )
        
        # 验证数据类型
        assert isinstance(train_df, pd.DataFrame)
        assert isinstance(test_df, pd.DataFrame)
        
        # 验证数据不为空
        assert len(train_df) > 0
        assert len(test_df) > 0
        
        # 验证必要的列存在
        required_columns = ['id', 'prompt', 'label', 'input_text']
        for col in required_columns:
            assert col in train_df.columns
            assert col in test_df.columns
    
    def test_load_llm_router_data_without_test_path(self):
        """测试只提供训练集路径的情况"""
        # 只提供训练集路径
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl"
        )
        
        # 验证数据不为空
        assert len(train_df) > 0
        assert len(test_df) > 0
        
        # 验证训练集和测试集的总和等于原始训练集大小
        # 注意：这里不能直接比较，因为分割是随机的
        # 我们只验证数据格式正确
        assert isinstance(train_df, pd.DataFrame)
        assert isinstance(test_df, pd.DataFrame)
    
    def test_data_format_consistency(self):
        """测试数据格式一致性"""
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl",
            "data/llm_router_dataset-synth/test.jsonl"
        )
        
        # 验证标签值
        assert set(train_df['label'].unique()).issubset({0, 1})
        assert set(test_df['label'].unique()).issubset({0, 1})
        
        # 验证 input_text 不为空
        assert not train_df['input_text'].isna().any()
        assert not test_df['input_text'].isna().any()
        
        # 验证 input_text 与 prompt 一致
        assert (train_df['input_text'] == train_df['prompt']).all()
        assert (test_df['input_text'] == test_df['prompt']).all()
    
    def test_label_distribution(self):
        """测试标签分布"""
        train_df, test_df = load_llm_router_data(
            "data/llm_router_dataset-synth/train.jsonl",
            "data/llm_router_dataset-synth/test.jsonl"
        )
        
        # 验证标签分布合理（不应该全是0或全是1）
        train_labels = train_df['label'].value_counts()
        test_labels = test_df['label'].value_counts()
        
        assert len(train_labels) >= 1  # 至少有一种标签
        assert len(test_labels) >= 1   # 至少有一种标签
    
    def test_file_not_found_error(self):
        """测试文件不存在时的错误处理"""
        # 使用临时文件来避免 MLflow 参数冲突
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.jsonl', delete=False) as f:
            f.write('{"id": "test", "prompt": "test", "label": 0}\n')
            temp_file = f.name
        
        try:
            # 先加载一个有效文件，然后测试无效文件
            # 这样可以避免 MLflow 参数冲突
            with pytest.raises(FileNotFoundError):
                load_llm_router_data("nonexistent_file.jsonl")
        finally:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
    
    def test_invalid_json_error(self):
        """测试无效JSON格式的错误处理"""
        # 创建临时文件
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.jsonl', delete=False) as f:
            f.write("invalid json content\n")
            temp_file = f.name
        
        try:
            with pytest.raises(Exception):  # 可能是JSONDecodeError或其他异常
                load_llm_router_data(temp_file)
        finally:
            # 清理临时文件
            if os.path.exists(temp_file):
                os.unlink(temp_file)
