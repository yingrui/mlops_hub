from transformers import AutoModelForSequenceClassification, AutoTokenizer
import os
import time
import requests
from src.utils.device import get_device, print_device_info
from src.utils.network import setup_hf_environment

class TextClassifier:
    def __init__(self, model_name: str, num_labels: int, device=None, **kwargs):
        # 设置环境
        setup_hf_environment()
        
        # 设置设备
        self.device = get_device(device) if device is not None else get_device('auto')
        print_device_info(self.device)
        
        # 使用 HF-Mirror 镜像站点
        mirror_urls = [
            "https://hf-mirror.com",  # 主要镜像
            "https://huggingface.co",  # 备用原站
        ]
        
        max_retries = 3
        for mirror_url in mirror_urls:
            for attempt in range(max_retries):
                try:
                    print(f"正在从 {mirror_url} 下载模型 {model_name}，尝试 {attempt + 1}/{max_retries}")
                    
                    # 设置镜像站点
                    os.environ['HF_ENDPOINT'] = mirror_url
                    
                    # 强制在线下载，不使用本地缓存
                    self.tokenizer = AutoTokenizer.from_pretrained(
                        model_name, 
                        trust_remote_code=True,
                        local_files_only=False,
                        cache_dir=None,  # 不使用缓存
                        force_download=True,  # 强制下载
                        mirror=mirror_url  # 使用镜像
                    )
                    self.model = AutoModelForSequenceClassification.from_pretrained(
                        model_name, 
                        num_labels=num_labels, 
                        trust_remote_code=True,
                        local_files_only=False,
                        cache_dir=None,  # 不使用缓存
                        force_download=True,  # 强制下载
                        mirror=mirror_url,  # 使用镜像
                        **kwargs
                    )
                    
                    # 将模型移动到指定设备
                    self.model = self.model.to(self.device)
                    print(f"✅ 模型 {model_name} 从 {mirror_url} 下载成功并移动到 {self.device}！")
                    return  # 成功则退出
                except requests.exceptions.ConnectionError as e:
                    print(f"❌ 网络连接错误 (镜像: {mirror_url}, 尝试: {attempt + 1}): {e}")
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 5
                        print(f"等待 {wait_time} 秒后重试...")
                        time.sleep(wait_time)
                except Exception as e:
                    print(f"❌ 其他错误 (镜像: {mirror_url}, 尝试: {attempt + 1}): {e}")
                    if attempt < max_retries - 1:
                        wait_time = 3
                        print(f"等待 {wait_time} 秒后重试...")
                        time.sleep(wait_time)
        
        # 所有镜像都失败了
        raise Exception(f"所有镜像站点都无法下载模型 {model_name}")

    def get_model(self):
        return self.model

    def get_tokenizer(self):
        return self.tokenizer
