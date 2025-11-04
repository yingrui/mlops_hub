"""
pytest 配置文件
"""

import pytest
import os
import sys
import tempfile
import shutil
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))


@pytest.fixture(scope="session")
def test_data_dir():
    """测试数据目录"""
    return project_root / "data" / "llm_router_dataset-synth"


@pytest.fixture(scope="session")
def temp_dir():
    """临时目录"""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)


@pytest.fixture(scope="function")
def mock_env_vars():
    """模拟环境变量"""
    original_env = {}
    test_env = {
        'HF_HUB_OFFLINE': '0',
        'TRANSFORMERS_CACHE': '',
        'HF_HOME': '',
        'HF_DATASETS_CACHE': '',
        'HF_ENDPOINT': 'https://hf-mirror.com'
    }
    
    # 保存原始环境变量
    for key in test_env.keys():
        original_env[key] = os.environ.get(key)
    
    # 设置测试环境变量
    for key, value in test_env.items():
        os.environ[key] = value
    
    yield test_env
    
    # 恢复原始环境变量
    for key, value in original_env.items():
        if value is not None:
            os.environ[key] = value
        elif key in os.environ:
            del os.environ[key]


@pytest.fixture(scope="function")
def sample_data():
    """示例数据"""
    return [
        {
            "id": "test-1",
            "prompt": "What is the capital of France?",
            "label": 0
        },
        {
            "id": "test-2", 
            "prompt": "Explain quantum mechanics in detail.",
            "label": 1
        },
        {
            "id": "test-3",
            "prompt": "How to make a sandwich?",
            "label": 0
        }
    ]


@pytest.fixture(scope="function")
def sample_jsonl_file(sample_data, temp_dir):
    """示例 JSONL 文件"""
    import json
    
    file_path = os.path.join(temp_dir, "sample.jsonl")
    with open(file_path, 'w', encoding='utf-8') as f:
        for item in sample_data:
            f.write(json.dumps(item) + '\n')
    
    return file_path


@pytest.fixture(scope="function")
def mock_predictions():
    """模拟预测结果"""
    import numpy as np
    
    class MockPred:
        def __init__(self):
            self.label_ids = np.array([0, 1, 0, 1, 0])
            self.predictions = np.array([
                [0.8, 0.2],  # 预测为0
                [0.3, 0.7],  # 预测为1
                [0.9, 0.1],  # 预测为0
                [0.2, 0.8],  # 预测为1
                [0.7, 0.3]   # 预测为0
            ])
    
    return MockPred()


def pytest_configure(config):
    """pytest 配置"""
    # 添加自定义标记
    config.addinivalue_line(
        "markers", "slow: 标记为慢速测试"
    )
    config.addinivalue_line(
        "markers", "integration: 标记为集成测试"
    )
    config.addinivalue_line(
        "markers", "unit: 标记为单元测试"
    )


def pytest_collection_modifyitems(config, items):
    """修改测试项"""
    # 为测试添加默认标记
    for item in items:
        if "test_data" in item.nodeid:
            item.add_marker(pytest.mark.data)
        elif "test_device" in item.nodeid:
            item.add_marker(pytest.mark.device)
        elif "test_network" in item.nodeid:
            item.add_marker(pytest.mark.network)
        elif "test_metrics" in item.nodeid:
            item.add_marker(pytest.mark.metrics)
        elif "test_integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        else:
            item.add_marker(pytest.mark.unit)
