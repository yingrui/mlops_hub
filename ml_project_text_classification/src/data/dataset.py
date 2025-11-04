"""
LLM Router 数据集类
"""

import torch
from torch.utils.data import Dataset
from transformers import PreTrainedTokenizer
from typing import List, Dict, Any, Optional
import pandas as pd


class LLMRouterDataset(Dataset):
    """
    LLM Router 数据集类
    
    用于处理 LLM Router 任务的文本分类数据集
    """
    
    def __init__(self, 
                 texts: List[str], 
                 labels: List[int], 
                 tokenizer: PreTrainedTokenizer,
                 max_length: int = 512,
                 truncation: bool = True,
                 padding: bool = True):
        """
        初始化数据集
        
        Args:
            texts: 文本列表
            labels: 标签列表
            tokenizer: 分词器
            max_length: 最大序列长度
            truncation: 是否截断
            padding: 是否填充
        """
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.truncation = truncation
        self.padding = padding
        
        # 预处理编码
        self.encodings = self.tokenizer(
            texts,
            truncation=truncation,
            padding=padding,
            max_length=max_length,
            return_tensors=None  # 返回列表而不是张量
        )
    
    def __len__(self) -> int:
        """返回数据集大小"""
        return len(self.labels)
    
    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        """
        获取单个样本
        
        Args:
            idx: 样本索引
            
        Returns:
            包含输入和标签的字典
        """
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item
    
    def get_label_distribution(self) -> Dict[int, int]:
        """
        获取标签分布
        
        Returns:
            标签分布字典
        """
        from collections import Counter
        return dict(Counter(self.labels))
    



class LLMRouterDataProcessor:
    """
    LLM Router 数据处理器
    
    用于从 DataFrame 创建数据集
    """
    
    def __init__(self, 
                 tokenizer: PreTrainedTokenizer,
                 max_length: int = 512,
                 truncation: bool = True,
                 padding: bool = True):
        """
        初始化数据处理器
        
        Args:
            tokenizer: 分词器
            max_length: 最大序列长度
            truncation: 是否截断
            padding: 是否填充
        """
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.truncation = truncation
        self.padding = padding
    
    def create_dataset(self, df: pd.DataFrame) -> LLMRouterDataset:
        """
        从 DataFrame 创建数据集
        
        Args:
            df: 包含 'input_text' 和 'label' 列的 DataFrame
            
        Returns:
            LLMRouterDataset 实例
        """
        texts = df['input_text'].tolist()
        labels = df['label'].tolist()
        
        return LLMRouterDataset(
            texts=texts,
            labels=labels,
            tokenizer=self.tokenizer,
            max_length=self.max_length,
            truncation=self.truncation,
            padding=self.padding
        )
    
    def create_train_test_datasets(self, 
                                  train_df: pd.DataFrame, 
                                  test_df: pd.DataFrame) -> tuple[LLMRouterDataset, LLMRouterDataset]:
        """
        创建训练集和测试集
        
        Args:
            train_df: 训练数据 DataFrame
            test_df: 测试数据 DataFrame
            
        Returns:
            (训练数据集, 测试数据集) 元组
        """
        train_dataset = self.create_dataset(train_df)
        test_dataset = self.create_dataset(test_df)
        
        return train_dataset, test_dataset
    



def create_datasets_from_dataframes(train_df: pd.DataFrame, 
                                   test_df: pd.DataFrame,
                                   tokenizer: PreTrainedTokenizer,
                                   max_length: int = 512) -> tuple[LLMRouterDataset, LLMRouterDataset]:
    """
    从 DataFrame 创建训练集和测试集的便捷函数
    
    Args:
        train_df: 训练数据 DataFrame
        test_df: 测试数据 DataFrame
        tokenizer: 分词器
        max_length: 最大序列长度
        
    Returns:
        (训练数据集, 测试数据集) 元组
    """
    processor = LLMRouterDataProcessor(
        tokenizer=tokenizer,
        max_length=max_length
    )
    
    return processor.create_train_test_datasets(train_df, test_df)


def create_test_dataset(test_df: pd.DataFrame,
                       tokenizer: PreTrainedTokenizer,
                       max_length: int = 512) -> LLMRouterDataset:
    """
    从 DataFrame 创建测试数据集的便捷函数
    
    Args:
        test_df: 测试数据 DataFrame
        tokenizer: 分词器
        max_length: 最大序列长度
        
    Returns:
        测试数据集
    """
    processor = LLMRouterDataProcessor(
        tokenizer=tokenizer,
        max_length=max_length
    )
    
    return processor.create_dataset(test_df)
