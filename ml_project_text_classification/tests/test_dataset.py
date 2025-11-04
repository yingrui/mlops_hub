"""
数据集类测试
"""

import pytest
import pandas as pd
import torch
from unittest.mock import Mock, MagicMock
from src.data.dataset import LLMRouterDataset, LLMRouterDataProcessor, create_datasets_from_dataframes, create_test_dataset


class TestLLMRouterDataset:
    """LLMRouterDataset 测试类"""
    
    def test_dataset_initialization(self):
        """测试数据集初始化"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3, 4], [5, 6, 7, 8]],
            'attention_mask': [[1, 1, 1, 1], [1, 1, 1, 1]]
        }
        
        texts = ["Hello world", "Test text"]
        labels = [0, 1]
        
        dataset = LLMRouterDataset(
            texts=texts,
            labels=labels,
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        # 验证基本属性
        assert len(dataset) == 2
        assert dataset.texts == texts
        assert dataset.labels == labels
        assert dataset.max_length == 512
        assert dataset.truncation is True
        assert dataset.padding is True
    
    def test_dataset_getitem(self):
        """测试数据集获取单个样本"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3, 4], [5, 6, 7, 8]],
            'attention_mask': [[1, 1, 1, 1], [1, 1, 1, 1]]
        }
        
        texts = ["Hello world", "Test text"]
        labels = [0, 1]
        
        dataset = LLMRouterDataset(
            texts=texts,
            labels=labels,
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        # 获取第一个样本
        item = dataset[0]
        
        # 验证返回的字典结构
        assert 'input_ids' in item
        assert 'attention_mask' in item
        assert 'labels' in item
        
        # 验证张量类型
        assert isinstance(item['input_ids'], torch.Tensor)
        assert isinstance(item['attention_mask'], torch.Tensor)
        assert isinstance(item['labels'], torch.Tensor)
        
        # 验证标签值
        assert item['labels'].item() == 0
    
    def test_dataset_label_distribution(self):
        """测试标签分布获取"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
            'attention_mask': [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
        }
        
        texts = ["Text 1", "Text 2", "Text 3"]
        labels = [0, 1, 0]  # 2个0，1个1
        
        dataset = LLMRouterDataset(
            texts=texts,
            labels=labels,
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        distribution = dataset.get_label_distribution()
        
        # 验证标签分布
        assert distribution[0] == 2
        assert distribution[1] == 1
    



class TestLLMRouterDataProcessor:
    """LLMRouterDataProcessor 测试类"""
    
    def test_processor_initialization(self):
        """测试数据处理器初始化"""
        mock_tokenizer = Mock()
        
        processor = LLMRouterDataProcessor(
            tokenizer=mock_tokenizer,
            max_length=256,
            truncation=False,
            padding=False
        )
        
        assert processor.tokenizer == mock_tokenizer
        assert processor.max_length == 256
        assert processor.truncation is False
        assert processor.padding is False
    
    def test_create_dataset_from_dataframe(self):
        """测试从 DataFrame 创建数据集"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3], [4, 5, 6]],
            'attention_mask': [[1, 1, 1], [1, 1, 1]]
        }
        
        # 创建测试 DataFrame
        df = pd.DataFrame({
            'input_text': ['Text 1', 'Text 2'],
            'label': [0, 1]
        })
        
        processor = LLMRouterDataProcessor(
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        dataset = processor.create_dataset(df)
        
        # 验证数据集
        assert len(dataset) == 2
        assert dataset.texts == ['Text 1', 'Text 2']
        assert dataset.labels == [0, 1]
    
    def test_create_train_test_datasets(self):
        """测试创建训练集和测试集"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3], [4, 5, 6]],
            'attention_mask': [[1, 1, 1], [1, 1, 1]]
        }
        
        # 创建测试 DataFrame
        train_df = pd.DataFrame({
            'input_text': ['Train 1', 'Train 2'],
            'label': [0, 1]
        })
        
        test_df = pd.DataFrame({
            'input_text': ['Test 1'],
            'label': [0]
        })
        
        processor = LLMRouterDataProcessor(
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        train_dataset, test_dataset = processor.create_train_test_datasets(train_df, test_df)
        
        # 验证训练集
        assert len(train_dataset) == 2
        assert train_dataset.texts == ['Train 1', 'Train 2']
        assert train_dataset.labels == [0, 1]
        
        # 验证测试集
        assert len(test_dataset) == 1
        assert test_dataset.texts == ['Test 1']
        assert test_dataset.labels == [0]
    



class TestDatasetFunctions:
    """数据集函数测试类"""
    
    def test_create_datasets_from_dataframes(self):
        """测试便捷函数 create_datasets_from_dataframes"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3], [4, 5, 6]],
            'attention_mask': [[1, 1, 1], [1, 1, 1]]
        }
        
        # 创建测试 DataFrame
        train_df = pd.DataFrame({
            'input_text': ['Train 1'],
            'label': [0]
        })
        
        test_df = pd.DataFrame({
            'input_text': ['Test 1'],
            'label': [1]
        })
        
        train_dataset, test_dataset = create_datasets_from_dataframes(
            train_df=train_df,
            test_df=test_df,
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        # 验证返回的数据集
        assert len(train_dataset) == 1
        assert len(test_dataset) == 1
        assert train_dataset.labels == [0]
        assert test_dataset.labels == [1]
    
    def test_create_test_dataset(self):
        """测试便捷函数 create_test_dataset"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [[1, 2, 3]],
            'attention_mask': [[1, 1, 1]]
        }
        
        # 创建测试 DataFrame
        test_df = pd.DataFrame({
            'input_text': ['Test 1', 'Test 2'],
            'label': [0, 1]
        })
        
        test_dataset = create_test_dataset(
            test_df=test_df,
            tokenizer=mock_tokenizer,
            max_length=256
        )
        
        # 验证返回的数据集
        assert len(test_dataset) == 2
        assert test_dataset.texts == ['Test 1', 'Test 2']
        assert test_dataset.labels == [0, 1]
        assert test_dataset.max_length == 256
    
    def test_empty_dataframe_handling(self):
        """测试空 DataFrame 处理"""
        # 创建模拟分词器
        mock_tokenizer = Mock()
        mock_tokenizer.return_value = {
            'input_ids': [],
            'attention_mask': []
        }
        
        # 创建空的 DataFrame
        empty_df = pd.DataFrame(columns=['input_text', 'label'])
        
        test_dataset = create_test_dataset(
            test_df=empty_df,
            tokenizer=mock_tokenizer,
            max_length=512
        )
        
        # 验证空数据集
        assert len(test_dataset) == 0
        assert test_dataset.texts == []
        assert test_dataset.labels == []
