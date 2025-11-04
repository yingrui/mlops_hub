"""
设备工具函数测试
"""

import pytest
import torch
from src.utils.device import get_device, print_device_info, get_device_recommendations


class TestDeviceUtils:
    """设备工具测试类"""
    
    def test_get_device_auto(self):
        """测试自动设备选择"""
        device = get_device('auto')
        
        # 验证返回的是 torch.device 对象
        assert isinstance(device, torch.device)
        
        # 验证设备类型是有效的
        assert device.type in ['cpu', 'cuda', 'mps']
    
    def test_get_device_cpu(self):
        """测试指定 CPU 设备"""
        device = get_device('cpu')
        
        assert isinstance(device, torch.device)
        assert device.type == 'cpu'
    
    def test_get_device_cuda(self):
        """测试指定 CUDA 设备"""
        device = get_device('cuda')
        
        assert isinstance(device, torch.device)
        assert device.type == 'cuda'
    
    def test_get_device_mps(self):
        """测试指定 MPS 设备"""
        device = get_device('mps')
        
        assert isinstance(device, torch.device)
        assert device.type == 'mps'
    
    def test_get_device_none(self):
        """测试传入 None 参数"""
        device = get_device(None)
        
        assert isinstance(device, torch.device)
        assert device.type in ['cpu', 'cuda', 'mps']
    
    def test_get_device_invalid(self):
        """测试无效设备参数"""
        # 对于无效的设备类型，torch.device 会抛出异常
        with pytest.raises(RuntimeError):
            get_device('invalid_device')
    
    def test_print_device_info(self, capsys):
        """测试设备信息打印"""
        device = get_device('auto')
        print_device_info(device)
        
        # 捕获输出并验证
        captured = capsys.readouterr()
        output = captured.out
        
        # 验证输出包含设备信息
        assert "使用设备:" in output
        assert device.type in output
        
        # 根据设备类型验证特定信息
        if device.type == 'cuda':
            assert "GPU:" in output
            assert "GPU 内存:" in output
        elif device.type == 'mps':
            assert "Apple Silicon GPU" in output
    
    def test_get_device_recommendations(self):
        """测试设备推荐功能"""
        recommendations = get_device_recommendations()
        
        # 验证返回的是字典
        assert isinstance(recommendations, dict)
        
        # 验证必要的键存在
        required_keys = ['batch_size', 'max_length', 'description']
        for key in required_keys:
            assert key in recommendations
        
        # 验证值的类型
        assert isinstance(recommendations['batch_size'], str)
        assert isinstance(recommendations['max_length'], str)
        assert isinstance(recommendations['description'], str)
        
        # 验证推荐值不为空
        assert recommendations['batch_size'] != ""
        assert recommendations['max_length'] != ""
        assert recommendations['description'] != ""
    
    def test_device_recommendations_consistency(self):
        """测试设备推荐的一致性"""
        # 多次调用应该返回相同的结果
        rec1 = get_device_recommendations()
        rec2 = get_device_recommendations()
        
        assert rec1 == rec2
    
    def test_cuda_availability_check(self):
        """测试 CUDA 可用性检查"""
        # 这个测试主要验证函数不会崩溃
        device = get_device('auto')
        
        if torch.cuda.is_available():
            # 如果 CUDA 可用，auto 应该选择 cuda
            assert device.type in ['cuda', 'cpu', 'mps']
        else:
            # 如果 CUDA 不可用，auto 应该选择 cpu 或 mps
            assert device.type in ['cpu', 'mps']
    
    def test_mps_availability_check(self):
        """测试 MPS 可用性检查"""
        device = get_device('auto')
        
        if hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            # 如果 MPS 可用，auto 可能选择 mps
            assert device.type in ['cuda', 'mps', 'cpu']
        else:
            # 如果 MPS 不可用，auto 应该选择 cpu 或 cuda
            assert device.type in ['cpu', 'cuda']
