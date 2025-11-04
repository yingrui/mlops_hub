import mlflow
import pandas as pd
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from src.utils.device import get_device, print_device_info
from src.utils.network import setup_hf_environment
import argparse
import json
import os

def load_model(model_path: str, device: str = 'auto'):
    """加载训练好的模型和tokenizer"""
    print(f"正在加载模型: {model_path}")
    
    # 设置设备
    device_obj = get_device(device)
    print_device_info(device_obj)
    
    # 检查路径是否存在
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"模型路径不存在: {model_path}")
    
    # 检查是否有tokenizer文件
    tokenizer_files = ['tokenizer.json', 'vocab.txt', 'tokenizer_config.json']
    has_tokenizer = any(os.path.exists(os.path.join(model_path, f)) for f in tokenizer_files)
    
    if not has_tokenizer:
        print("⚠️  模型目录中没有找到tokenizer文件，尝试从HF-Mirror加载tokenizer...")
        try:
            # 设置HF-Mirror环境变量
            os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
            # 从HF-Mirror加载tokenizer
            tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
            # 保存tokenizer到模型目录
            tokenizer.save_pretrained(model_path)
            print("✅ tokenizer已保存到模型目录")
        except Exception as e:
            print(f"❌ 从HF-Mirror加载tokenizer失败: {e}")
            print("尝试使用本地缓存的tokenizer...")
            # 尝试使用本地缓存
            tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased", local_files_only=True)
            tokenizer.save_pretrained(model_path)
            print("✅ 使用本地缓存加载tokenizer成功")
    else:
        print("✅ 找到tokenizer文件")
        tokenizer = AutoTokenizer.from_pretrained(model_path)
    
    # 加载模型并移动到指定设备
    model = AutoModelForSequenceClassification.from_pretrained(model_path)
    model = model.to(device_obj)
    print("✅ 模型加载成功并移动到设备")
    
    return model, tokenizer

def predict_single(model, tokenizer, prompt: str, max_length: int = 512):
    """预测单条数据"""
    input_text = prompt
    
    # tokenize
    inputs = tokenizer(input_text, truncation=True, padding=True, max_length=max_length, return_tensors="pt")
    
    # 将输入移动到模型所在设备
    device = next(model.parameters()).device
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    # predict
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.softmax(outputs.logits, dim=-1)
        predicted_class = torch.argmax(predictions, dim=-1).item()
        confidence = predictions[0][predicted_class].item()
    
    return {
        'predicted_class': predicted_class,
        'confidence': confidence,
        'predicted_label': predicted_class,
        'probabilities': predictions[0].tolist()
    }

def predict_batch(model, tokenizer, data_path: str, output_path: str, max_length: int = 512):
    """批量预测 LLM Router 数据"""
    results = []
    
    with open(data_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line.strip())
            
            prediction = predict_single(
                model, tokenizer, 
                data['prompt'], 
                max_length
            )
            
            result = {
                'id': data.get('id', ''),
                'prompt': data['prompt'],
                'prediction': prediction,
                'true_label': data['label']
            }
            
            results.append(result)
    
    # 保存结果
    with open(output_path, 'w', encoding='utf-8') as f:
        for result in results:
            f.write(json.dumps(result, ensure_ascii=False) + '\n')
    
    # 计算准确率
    correct = sum(1 for r in results if r['prediction']['predicted_label'] == r['true_label'])
    accuracy = correct / len(results)
    
    print(f"Batch prediction complete. Accuracy: {accuracy:.4f}")
    return results

def main(args):
    # 设置环境
    setup_hf_environment()
    
    print("🔮 开始预测...")
    
    # 加载模型
    model, tokenizer = load_model(args.model_path, args.device)
    
    if args.single:
        # 单条预测
        if not args.prompt:
            raise ValueError("单条预测模式需要提供 --prompt 参数")
        
        prediction = predict_single(
            model, tokenizer,
            args.prompt,
            args.max_length
        )
        print("Prediction:", prediction)
    else:
        # 批量预测
        results = predict_batch(
            model, tokenizer,
            args.data_path,
            args.output_path,
            args.max_length
        )

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--model_path', type=str, required=True, help='训练好的模型路径')
    parser.add_argument('--single', action='store_true', help='单条预测模式')
    parser.add_argument('--prompt', type=str, help='提示文本（单条预测模式）')
    parser.add_argument('--data_path', type=str, default='data/llm_router_dataset-synth/test.jsonl', help='数据文件路径（批量预测模式）')
    parser.add_argument('--output_path', type=str, default='predictions.jsonl', help='预测结果输出路径')
    parser.add_argument('--max_length', type=int, default=512, help='最大序列长度')
    parser.add_argument('--device', type=str, default='auto', 
                       choices=['auto', 'cpu', 'cuda', 'mps'],
                       help='设备选择: auto(自动), cpu, cuda, mps')
    args = parser.parse_args()
    main(args)

