"""
网络工具函数测试
"""

import pytest
import os
from unittest.mock import patch, Mock
from src.utils.network import check_network_connection, setup_hf_environment


class TestNetworkUtils:
    """网络工具测试类"""
    
    def test_setup_hf_environment(self):
        """测试 HuggingFace 环境设置"""
        # 保存原始环境变量
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
    
    @patch('src.utils.network.requests.get')
    def test_check_network_connection_success_first_mirror(self, mock_get):
        """测试第一个镜像站点连接成功"""
        # 模拟第一个镜像站点成功
        mock_response = Mock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # 保存原始环境变量
        original_hf_endpoint = os.environ.get('HF_ENDPOINT')
        
        try:
            result = check_network_connection()
            
            # 验证结果
            assert result is True
            
            # 验证环境变量设置
            assert os.environ['HF_ENDPOINT'] == 'https://hf-mirror.com'
            
            # 验证调用
            mock_get.assert_called_once_with('https://hf-mirror.com', timeout=10)
        
        finally:
            # 恢复原始环境变量
            if original_hf_endpoint is not None:
                os.environ['HF_ENDPOINT'] = original_hf_endpoint
            elif 'HF_ENDPOINT' in os.environ:
                del os.environ['HF_ENDPOINT']
    
    @patch('src.utils.network.requests.get')
    def test_check_network_connection_success_second_mirror(self, mock_get):
        """测试第二个镜像站点连接成功"""
        # 模拟第一个镜像站点失败，第二个成功
        mock_get.side_effect = [
            Exception("Connection failed"),  # 第一个镜像失败
            Mock(status_code=200)  # 第二个镜像成功
        ]
        
        # 保存原始环境变量
        original_hf_endpoint = os.environ.get('HF_ENDPOINT')
        
        try:
            result = check_network_connection()
            
            # 验证结果
            assert result is True
            
            # 验证环境变量设置
            assert os.environ['HF_ENDPOINT'] == 'https://huggingface.co'
            
            # 验证调用次数
            assert mock_get.call_count == 2
        
        finally:
            # 恢复原始环境变量
            if original_hf_endpoint is not None:
                os.environ['HF_ENDPOINT'] = original_hf_endpoint
            elif 'HF_ENDPOINT' in os.environ:
                del os.environ['HF_ENDPOINT']
    
    @patch('src.utils.network.requests.get')
    def test_check_network_connection_all_failed(self, mock_get):
        """测试所有镜像站点连接失败"""
        # 模拟所有镜像站点失败
        mock_get.side_effect = Exception("Connection failed")
        
        result = check_network_connection()
        
        # 验证结果
        assert result is False
        
        # 验证调用次数
        assert mock_get.call_count == 2
    
    @patch('src.utils.network.requests.get')
    def test_check_network_connection_custom_mirrors(self, mock_get):
        """测试自定义镜像站点列表"""
        # 模拟自定义镜像站点成功
        mock_response = Mock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        custom_mirrors = ['https://custom-mirror.com']
        
        # 保存原始环境变量
        original_hf_endpoint = os.environ.get('HF_ENDPOINT')
        
        try:
            result = check_network_connection(custom_mirrors)
            
            # 验证结果
            assert result is True
            
            # 验证环境变量设置
            assert os.environ['HF_ENDPOINT'] == 'https://custom-mirror.com'
            
            # 验证调用
            mock_get.assert_called_once_with('https://custom-mirror.com', timeout=10)
        
        finally:
            # 恢复原始环境变量
            if original_hf_endpoint is not None:
                os.environ['HF_ENDPOINT'] = original_hf_endpoint
            elif 'HF_ENDPOINT' in os.environ:
                del os.environ['HF_ENDPOINT']
    
    @patch('src.utils.network.requests.get')
    def test_check_network_connection_timeout(self, mock_get):
        """测试网络连接超时"""
        # 模拟超时异常
        mock_get.side_effect = Exception("Timeout")
        
        result = check_network_connection()
        
        # 验证结果
        assert result is False
    
    @patch('src.utils.network.requests.get')
    def test_check_network_connection_non_200_status(self, mock_get):
        """测试非200状态码"""
        # 模拟返回非200状态码
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        result = check_network_connection()
        
        # 验证结果
        assert result is False
    
    def test_check_network_connection_no_mirrors(self):
        """测试空镜像站点列表"""
        result = check_network_connection([])
        
        # 验证结果
        assert result is False
    
    def test_check_network_connection_none_mirrors(self):
        """测试 None 镜像站点列表"""
        result = check_network_connection(None)
        
        # 验证结果（应该使用默认镜像站点）
        # 这里我们只验证函数不会崩溃
        assert isinstance(result, bool)
