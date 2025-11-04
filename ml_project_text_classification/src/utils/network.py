"""
网络连接检查工具函数
"""

import requests
import os
from typing import List, Optional

def check_network_connection(mirror_urls: Optional[List[str]] = None) -> bool:
    """
    检查网络连接 - 测试多个镜像站点
    
    Args:
        mirror_urls: 镜像站点列表，如果为None则使用默认列表
    
    Returns:
        bool: 是否连接成功
    """
    if mirror_urls is None:
        mirror_urls = [
            "https://hf-mirror.com",
            "https://huggingface.co"
        ]
    
    for url in mirror_urls:
        try:
            print(f"测试连接: {url}")
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"✅ 可以连接到: {url}")
                os.environ['HF_ENDPOINT'] = url
                return True
        except Exception as e:
            print(f"❌ 无法连接到: {url}")
    
    return False

def setup_hf_environment() -> None:
    """
    设置 HuggingFace 环境变量
    """
    os.environ['HF_HUB_OFFLINE'] = '0'  # 强制在线模式
    os.environ['TRANSFORMERS_CACHE'] = ''  # 禁用缓存
    os.environ['HF_HOME'] = ''  # 禁用缓存
    os.environ['HF_DATASETS_CACHE'] = ''  # 禁用数据集缓存
    os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'  # 使用 HF-Mirror
