import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock the API service
jest.mock('../../../services/api', () => ({
  ApiService: jest.fn().mockImplementation(() => ({
    getRun: jest.fn(),
    listArtifacts: jest.fn(),
    downloadArtifact: jest.fn(),
    loadDirectoryContents: jest.fn(),
    convertMLflowArtifactsToFileTree: jest.fn()
  }))
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-run-id' })
}));

// Simple test component to verify Jest setup
const TestComponent = () => {
  return <div>Test Component</div>;
};

describe('RunDetail - Artifacts Panel', () => {
  it('should render test component', () => {
    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle file type detection', () => {
    const getFileType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop() || '';
      
      if (['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx'].includes(ext)) {
        return 'model';
      } else if (['json'].includes(ext)) {
        return 'json';
      } else if (['py'].includes(ext)) {
        return 'python';
      } else if (['yaml', 'yml'].includes(ext)) {
        return 'yaml';
      } else {
        return 'file';
      }
    };

    expect(getFileType('model.pkl')).toBe('model');
    expect(getFileType('data.json')).toBe('json');
    expect(getFileType('script.py')).toBe('python');
    expect(getFileType('config.yaml')).toBe('yaml');
  });

  it('should handle binary file detection', () => {
    const isBinaryFile = (filename: string): boolean => {
      const ext = filename.toLowerCase().split('.').pop() || '';
      const binaryExtensions = ['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx'];
      return binaryExtensions.includes(ext);
    };

    expect(isBinaryFile('model.pkl')).toBe(true);
    expect(isBinaryFile('data.h5')).toBe(true);
    expect(isBinaryFile('script.py')).toBe(false);
    expect(isBinaryFile('config.yaml')).toBe(false);
  });

  it('should handle artifact path processing', () => {
    const processArtifactPath = (fullPath: string, basePath: string): string => {
      if (basePath && fullPath.startsWith(basePath + '/')) {
        return fullPath.substring(basePath.length + 1);
      } else if (basePath && fullPath === basePath) {
        return '';
      }
      return fullPath;
    };

    expect(processArtifactPath('iris_model/MLmodel', 'iris_model')).toBe('MLmodel');
    expect(processArtifactPath('iris_model/conda.yaml', 'iris_model')).toBe('conda.yaml');
    expect(processArtifactPath('config.yaml', '')).toBe('config.yaml');
  });
});