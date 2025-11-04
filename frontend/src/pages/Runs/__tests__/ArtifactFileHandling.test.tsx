import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RunDetail from '../RunDetail';
import { apiService } from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api', () => ({
  apiService: {
    getRun: jest.fn().mockResolvedValue({
      id: 'test-run-id',
      name: 'Test Run',
      status: 'finished',
      experimentId: '1',
      startedAt: '2024-01-01T00:00:00Z',
      endedAt: '2024-01-01T01:00:00Z',
      duration: 3600,
      parameters: {},
      metrics: {},
      artifacts: [],
      logs: [],
      tags: [],
      artifactUri: 's3://mlflow/1/test-run-id/artifacts'
    }),
    listArtifacts: jest.fn().mockResolvedValue({
      root_uri: 's3://mlflow/1/test-run-id/artifacts',
      files: [
        { path: 'iris_model', is_dir: true },
        { path: 'iris_model/MLmodel', is_dir: false, file_size: 927 },
        { path: 'iris_model/model.pkl', is_dir: false, file_size: 1024, isBinary: true },
        { path: 'iris_model/python_env.yaml', is_dir: false, file_size: 120 },
        { path: 'iris_model/requirements.txt', is_dir: false, file_size: 135 },
        { path: 'iris_model/large_file.bin', is_dir: false, file_size: 2097152, isBinary: true },
        { path: 'iris_model/config.json', is_dir: false, file_size: 256 },
        { path: 'iris_model/image.png', is_dir: false, file_size: 512, isBinary: true }
      ]
    }),
    downloadArtifact: jest.fn(),
    loadDirectoryContents: jest.fn().mockResolvedValue({
      root_uri: 's3://mlflow/1/test-run-id/artifacts',
      files: [
        { path: 'iris_model/MLmodel', is_dir: false, file_size: 927 },
        { path: 'iris_model/model.pkl', is_dir: false, file_size: 1024, isBinary: true },
        { path: 'iris_model/python_env.yaml', is_dir: false, file_size: 120 },
        { path: 'iris_model/requirements.txt', is_dir: false, file_size: 135 },
        { path: 'iris_model/large_file.bin', is_dir: false, file_size: 2097152, isBinary: true },
        { path: 'iris_model/config.json', is_dir: false, file_size: 256 },
        { path: 'iris_model/image.png', is_dir: false, file_size: 512, isBinary: true }
      ]
    }),
    convertMLflowToRun: jest.fn((run) => run),
    convertMLflowArtifactsToFileTree: jest.fn(() => ({
      children: [
        {
          name: 'iris_model',
          type: 'folder',
          isDir: true,
          children: [
            { name: 'MLmodel', type: 'file', isDir: false, size: 927, isBinary: false },
            { name: 'model.pkl', type: 'file', isDir: false, size: 1024, isBinary: true },
            { name: 'python_env.yaml', type: 'file', isDir: false, size: 120, isBinary: false },
            { name: 'requirements.txt', type: 'file', isDir: false, size: 135, isBinary: false },
            { name: 'large_file.bin', type: 'file', isDir: false, size: 2097152, isBinary: true },
            { name: 'config.json', type: 'file', isDir: false, size: 256, isBinary: false },
            { name: 'image.png', type: 'file', isDir: false, size: 512, isBinary: true }
          ]
        }
      ]
    })),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-run-id' }),
  useNavigate: () => jest.fn(),
}));

describe('Artifact File Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render artifacts when data is loaded', async () => {
    render(<RunDetail />);

    // Wait for component to finish loading
    await waitFor(() => {
      expect(screen.getByText('Test Run')).toBeInTheDocument();
    });

    // Wait for tabs to be rendered
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    });

    // Switch to Artifacts tab
    const artifactsTab = screen.getByRole('tab', { name: /artifacts/i });
    fireEvent.click(artifactsTab);

    // Wait for artifacts to load
    await waitFor(() => {
      expect(screen.getByText('iris_model')).toBeInTheDocument();
    }, { timeout: 10000 });

    // Click on the folder to expand it
    const folder = screen.getByText('iris_model');
    fireEvent.click(folder);

    // Wait for the folder to expand and show children
    await waitFor(() => {
      expect(screen.getByText('MLmodel')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check if individual files are rendered
    expect(screen.getByText('python_env.yaml')).toBeInTheDocument();
    expect(screen.getByText('config.json')).toBeInTheDocument();
  });
});