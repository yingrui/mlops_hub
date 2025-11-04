"""
设备管理工具函数
"""

import torch
from typing import Union, Optional

def get_device(device: str = 'auto') -> torch.device:
    """
    获取设备对象
    
    Args:
        device: 设备选择 ('auto', 'cpu', 'cuda', 'mps') 或 None
    
    Returns:
        torch.device: 设备对象
    """
    if device is None or device == 'auto':
        if torch.cuda.is_available():
            return torch.device('cuda')
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            return torch.device('mps')
        else:
            return torch.device('cpu')
    else:
        return torch.device(device)

def print_device_info(device: torch.device) -> None:
    """
    打印设备信息
    
    Args:
        device: 设备对象
    """
    print(f"🖥️  使用设备: {device}")
    
    if device.type == 'cuda':
        print(f"🎮 GPU: {torch.cuda.get_device_name(0)}")
        print(f"💾 GPU 内存: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
    elif device.type == 'mps':
        print("🍎 使用 Apple Silicon GPU (MPS)")

def get_device_recommendations() -> dict:
    """
    获取设备推荐配置
    
    Returns:
        dict: 设备推荐配置
    """
    if torch.cuda.is_available():
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
        if gpu_memory >= 8:
            return {
                'batch_size': '16-32',
                'max_length': '512-1024',
                'description': 'NVIDIA GPU 8GB+'
            }
        elif gpu_memory >= 4:
            return {
                'batch_size': '8-16',
                'max_length': '256-512',
                'description': 'NVIDIA GPU 4-8GB'
            }
        else:
            return {
                'batch_size': '4-8',
                'max_length': '128-256',
                'description': 'NVIDIA GPU <4GB'
            }
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return {
            'batch_size': '8-16',
            'max_length': '256-512',
            'description': 'Apple Silicon GPU'
        }
    else:
        return {
            'batch_size': '2-4',
            'max_length': '128-256',
            'description': 'CPU'
        }
