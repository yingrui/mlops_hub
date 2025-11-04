import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../config';
import {
  Dataset,
  DatasetVersion,
  DatasetFile,
  ApiResponse,
  SearchFilters,
  MLflowRegisteredModel,
  MLflowModelVersion,
  MLflowRegisteredModelsResponse,
  MLflowModelVersionsResponse,
  Model,
  Experiment,
  InferenceService,
} from '../types';

// Global reference to get token function
let getTokenFunction: (() => Promise<string | null>) | null = null;

export const setTokenProvider = (tokenProvider: () => Promise<string | null>) => {
  getTokenFunction = tokenProvider;
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: config.api.baseUrl,
      timeout: 10000,
    });

    // Request interceptor to add authentication token
    this.api.interceptors.request.use(
      async config => {
        // Get token from the global token provider
        const token = await this.getToken();
        console.log('API Request Token:', token ? 'Present' : 'None');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    this.api.interceptors.response.use(
      response => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      async error => {
        console.error('API Error:', error.response?.status, error.response?.data, error.config?.url);
        if (error.response?.status === 401) {
          // Token expired or invalid, redirect to login
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  private async getToken(): Promise<string | null> {
    if (getTokenFunction) {
      return await getTokenFunction();
    }
    return null;
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Health check endpoint (public)
  async healthCheck(): Promise<any> {
    const response = await axios.get(`${config.api.baseUrl}/api/health`);
    return response.data;
  }

  // Dataset API methods
  async getDatasets(): Promise<Dataset[]> {
    return this.get<Dataset[]>('/api/datasets');
  }

  async getDatasetsPaged(page: number = 0, size: number = 10): Promise<any> {
    return this.get(`/api/datasets/paged?page=${page}&size=${size}`);
  }

  async getDataset(id: string): Promise<Dataset> {
    return this.get<Dataset>(`/api/datasets/${id}`);
  }

  async createDataset(dataset: Partial<Dataset>): Promise<Dataset> {
    return this.post<Dataset>('/api/datasets', dataset);
  }

  async updateDataset(id: string, dataset: Partial<Dataset>): Promise<Dataset> {
    return this.put<Dataset>(`/api/datasets/${id}`, dataset);
  }

  async deleteDataset(id: string): Promise<void> {
    return this.delete<void>(`/api/datasets/${id}`);
  }

  async searchDatasets(query: string): Promise<Dataset[]> {
    return this.get<Dataset[]>(`/api/datasets/search?name=${encodeURIComponent(query)}`);
  }

  async getDatasetsByType(type: string): Promise<Dataset[]> {
    return this.get<Dataset[]>(`/api/datasets/type/${encodeURIComponent(type)}`);
  }

  async getDatasetByName(name: string): Promise<Dataset> {
    return this.get<Dataset>(`/api/datasets/name/${encodeURIComponent(name)}`);
  }

  async getDatasetCount(): Promise<{ count: number }> {
    return this.get<{ count: number }>('/api/datasets/count');
  }

  async getRecentDatasets(limit: number = 10): Promise<Dataset[]> {
    return this.get<Dataset[]>(`/api/datasets/recent?limit=${limit}`);
  }

  async downloadDataset(id: string): Promise<Blob> {
    const response = await this.api.get(`/api/datasets/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Helper method to download dataset file
  async downloadDatasetFile(id: string, filename: string): Promise<void> {
    try {
      const blob = await this.downloadDataset(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading dataset:', error);
      throw error;
    }
  }

  // Version Management API methods
  async createVersion(datasetId: string, description?: string): Promise<DatasetVersion> {
    const params = new URLSearchParams();
    if (description) {
      params.append('description', description);
    }
    return this.post<DatasetVersion>(`/api/datasets/${datasetId}/versions?${params.toString()}`);
  }

  async getVersions(datasetId: string): Promise<DatasetVersion[]> {
    return this.get<DatasetVersion[]>(`/api/datasets/${datasetId}/versions`);
  }

  async getVersion(datasetId: string, versionId: string): Promise<DatasetVersion> {
    return this.get<DatasetVersion>(`/api/datasets/${datasetId}/versions/${versionId}`);
  }

  async commitVersion(datasetId: string, versionId: string): Promise<DatasetVersion> {
    return this.put<DatasetVersion>(`/api/datasets/${datasetId}/versions/${versionId}/commit`);
  }

  async archiveVersion(datasetId: string, versionId: string): Promise<DatasetVersion> {
    return this.put<DatasetVersion>(`/api/datasets/${datasetId}/versions/${versionId}/archive`);
  }

  async deleteVersion(datasetId: string, versionId: string): Promise<void> {
    return this.delete<void>(`/api/datasets/${datasetId}/versions/${versionId}`);
  }

  // File Management API methods
  async uploadFile(datasetId: string, versionId: string, file: File): Promise<DatasetFile> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<DatasetFile>(
      `/api/datasets/${datasetId}/versions/${versionId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  async getFiles(datasetId: string, versionId: string): Promise<DatasetFile[]> {
    return this.get<DatasetFile[]>(`/api/datasets/${datasetId}/versions/${versionId}/files`);
  }

  async downloadFile(datasetId: string, versionId: string, fileId: string): Promise<Blob> {
    const response = await this.api.get(
      `/api/datasets/${datasetId}/versions/${versionId}/files/${fileId}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  async deleteFile(datasetId: string, versionId: string, fileId: string): Promise<void> {
    return this.delete<void>(`/api/datasets/${datasetId}/versions/${versionId}/files/${fileId}`);
  }

  // Helper method to download version file
  async downloadVersionFile(
    datasetId: string,
    versionId: string,
    fileId: string,
    filename: string
  ): Promise<void> {
    try {
      const blob = await this.downloadFile(datasetId, versionId, fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // MLflow Model API methods
  async getMLflowModels(): Promise<MLflowRegisteredModelsResponse> {
    return this.get<MLflowRegisteredModelsResponse>('/api/models');
  }

  async getMLflowModel(name: string): Promise<MLflowRegisteredModel> {
    return this.get<MLflowRegisteredModel>(`/api/models/${encodeURIComponent(name)}`);
  }

  async createMLflowModel(name: string, description?: string): Promise<MLflowRegisteredModel> {
    return this.post<MLflowRegisteredModel>('/api/models', {
      name,
      description,
    });
  }

  async updateMLflowModel(name: string, description?: string): Promise<MLflowRegisteredModel> {
    return this.put<MLflowRegisteredModel>(`/api/models/${encodeURIComponent(name)}`, {
      description,
    });
  }

  async deleteMLflowModel(name: string): Promise<void> {
    return this.delete<void>(`/api/models/${encodeURIComponent(name)}`);
  }

  async searchMLflowModels(filter?: string): Promise<MLflowRegisteredModelsResponse> {
    const params = filter ? `?filter=${encodeURIComponent(filter)}` : '';
    return this.get<MLflowRegisteredModelsResponse>(`/api/models/search${params}`);
  }

  // Model Version API methods
  async getMLflowModelVersions(name: string): Promise<MLflowModelVersionsResponse> {
    return this.get<MLflowModelVersionsResponse>(
      `/api/models/${encodeURIComponent(name)}/versions`
    );
  }

  async getMLflowModelVersion(name: string, version: string): Promise<MLflowModelVersion> {
    return this.get<MLflowModelVersion>(
      `/api/models/${encodeURIComponent(name)}/versions/${version}`
    );
  }

  async createMLflowModelVersion(
    name: string,
    source: string,
    runId: string
  ): Promise<MLflowModelVersion> {
    return this.post<MLflowModelVersion>(`/api/models/${encodeURIComponent(name)}/versions`, {
      source,
      run_id: runId,
    });
  }

  async updateMLflowModelVersion(
    name: string,
    version: string,
    description?: string,
    stage?: string
  ): Promise<MLflowModelVersion> {
    return this.put<MLflowModelVersion>(
      `/api/models/${encodeURIComponent(name)}/versions/${version}`,
      { description, stage }
    );
  }

  async transitionMLflowModelVersionStage(
    name: string,
    version: string,
    stage: string,
    archiveExistingVersions?: boolean
  ): Promise<MLflowModelVersion> {
    return this.post<MLflowModelVersion>(
      `/api/models/${encodeURIComponent(name)}/versions/${version}/transition-stage`,
      {
        stage,
        archive_existing_versions: archiveExistingVersions || false,
      }
    );
  }

  async deleteMLflowModelVersion(name: string, version: string): Promise<void> {
    return this.delete<void>(`/api/models/${encodeURIComponent(name)}/versions/${version}`);
  }

  async getLatestMLflowModelVersions(
    name: string,
    stages?: string
  ): Promise<MLflowModelVersionsResponse> {
    const params = stages ? `?stages=${encodeURIComponent(stages)}` : '';
    return this.get<MLflowModelVersionsResponse>(
      `/api/models/${encodeURIComponent(name)}/versions/latest${params}`
    );
  }

  // Enhanced data API methods (using MLflowFacadeService)
  async getEnhancedModels(): Promise<MLflowRegisteredModelsResponse> {
    return this.get<MLflowRegisteredModelsResponse>('/api/data/models');
  }

  async getEnhancedModelVersions(name: string): Promise<MLflowModelVersionsResponse> {
    return this.get<MLflowModelVersionsResponse>(
      `/api/data/models/${encodeURIComponent(name)}/versions`
    );
  }

  // Helper method to convert MLflow data to frontend Model format
  convertMLflowToModel(
    mlflowModel: MLflowRegisteredModel,
    latestVersion?: MLflowModelVersion
  ): Model {
    const version = latestVersion || mlflowModel.latest_versions?.[0];

    // Helper function to safely convert timestamp to ISO string
    const safeTimestampToISO = (timestamp: number | undefined): string => {
      if (!timestamp) return new Date().toISOString();
      try {
        // MLflow timestamps are in milliseconds
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp:', timestamp);
          return new Date().toISOString();
        }
        return date.toISOString();
      } catch (error) {
        console.warn('Error converting timestamp:', timestamp, error);
        return new Date().toISOString();
      }
    };

    return {
      id: mlflowModel.name, // Use name as ID for MLflow models
      name: mlflowModel.name,
      description: mlflowModel.description || '',
      version: version?.version || '1.0.0',
      framework: this.detectFramework(version?.source || ''),
      tags: mlflowModel.tags?.map(tag => tag.value) || [],
      visibility: 'public', // MLflow doesn't have visibility concept, default to public
      owner: {
        id: mlflowModel.user_id || 'unknown',
        username: mlflowModel.user_id || 'unknown',
        email: '',
        role: 'user',
        createdAt: safeTimestampToISO(mlflowModel.creation_timestamp),
      },
      createdAt: safeTimestampToISO(mlflowModel.creation_timestamp),
      updatedAt: safeTimestampToISO(mlflowModel.last_updated_timestamp),
      downloadCount: 0, // MLflow doesn't track downloads
      files: [],
      metadata: {
        source: version?.source,
        runId: version?.run_id,
        status: version?.status,
      },
      performance: {
        accuracy: 0, // Would need to fetch from run metrics
        metrics: {},
      },
      // MLflow-specific fields
      mlflowName: mlflowModel.name,
      mlflowVersion: version?.version,
      currentStage: version?.current_stage,
      source: version?.source,
      runId: version?.run_id,
      status: version?.status,
      statusMessage: version?.status_message,
      runLink: version?.run_link,
      creationTimestamp: mlflowModel.creation_timestamp,
      lastUpdatedTimestamp: mlflowModel.last_updated_timestamp,
    };
  }

  private detectFramework(source: string): 'tensorflow' | 'pytorch' | 'sklearn' | 'onnx' | 'other' {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('tensorflow') || sourceLower.includes('tf')) return 'tensorflow';
    if (sourceLower.includes('pytorch') || sourceLower.includes('torch')) return 'pytorch';
    if (sourceLower.includes('sklearn') || sourceLower.includes('scikit')) return 'sklearn';
    if (sourceLower.includes('onnx')) return 'onnx';
    return 'other';
  }

  // Experiment API methods
  async getExperiments(): Promise<any> {
    try {
      const response = await this.api.get('/api/experiments');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch experiments:', error);
      throw error;
    }
  }

  async getExperiment(experimentId: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/experiments/${experimentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch experiment:', error);
      throw error;
    }
  }

  async getExperimentByName(experimentName: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/experiments/by-name/${experimentName}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch experiment by name:', error);
      throw error;
    }
  }

  async createExperiment(name: string): Promise<any> {
    try {
      const response = await this.api.post('/api/experiments', { name });
      return response.data;
    } catch (error) {
      console.error('Failed to create experiment:', error);
      throw error;
    }
  }

  async updateExperiment(experimentId: string, newName: string): Promise<any> {
    try {
      const response = await this.api.put(`/api/experiments/${experimentId}`, { new_name: newName });
      return response.data;
    } catch (error) {
      console.error('Failed to update experiment:', error);
      throw error;
    }
  }

  async deleteExperiment(experimentId: string): Promise<any> {
    try {
      const response = await this.api.delete(`/api/experiments/${experimentId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete experiment:', error);
      throw error;
    }
  }

  async restoreExperiment(experimentId: string): Promise<any> {
    try {
      const response = await this.api.post(`/api/experiments/${experimentId}/restore`);
      return response.data;
    } catch (error) {
      console.error('Failed to restore experiment:', error);
      throw error;
    }
  }

  async searchExperiments(filter: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/experiments/search?filter=${encodeURIComponent(filter)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search experiments:', error);
      throw error;
    }
  }

  // Run API methods
  async getRun(runId: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/runs/${runId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch run:', error);
      throw error;
    }
  }

  async searchRuns(experimentIds?: string, filter?: string, runViewType?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (experimentIds) params.append('experiment_ids', experimentIds);
      if (filter) params.append('filter', filter);
      if (runViewType) params.append('run_view_type', runViewType);
      
      const response = await this.api.get(`/api/runs/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search runs:', error);
      throw error;
    }
  }

  async createRun(experimentId: string): Promise<any> {
    try {
      const response = await this.api.post('/api/runs', { experiment_id: experimentId });
      return response.data;
    } catch (error) {
      console.error('Failed to create run:', error);
      throw error;
    }
  }

  async updateRun(runId: string, status?: string, endTime?: string): Promise<any> {
    try {
      const body: any = {};
      if (status) body.status = status;
      if (endTime) body.end_time = endTime;
      
      const response = await this.api.put(`/api/runs/${runId}`, body);
      return response.data;
    } catch (error) {
      console.error('Failed to update run:', error);
      throw error;
    }
  }

  async deleteRun(runId: string): Promise<any> {
    try {
      const response = await this.api.delete(`/api/runs/${runId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete run:', error);
      throw error;
    }
  }

  async logMetric(runId: string, key: string, value: number): Promise<any> {
    try {
      const response = await this.api.post(`/api/runs/${runId}/metrics`, { key, value });
      return response.data;
    } catch (error) {
      console.error('Failed to log metric:', error);
      throw error;
    }
  }

  async getMetricHistory(runId: string, metricKey: string): Promise<any> {
    try {
      const response = await this.api.get(`/api/runs/${runId}/metrics/${metricKey}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to get metric history:', error);
      throw error;
    }
  }

  async logParameter(runId: string, key: string, value: string): Promise<any> {
    try {
      const response = await this.api.post(`/api/runs/${runId}/parameters`, { key, value });
      return response.data;
    } catch (error) {
      console.error('Failed to log parameter:', error);
      throw error;
    }
  }

  async setTag(runId: string, key: string, value: string): Promise<any> {
    try {
      const response = await this.api.post(`/api/runs/${runId}/tags`, { key, value });
      return response.data;
    } catch (error) {
      console.error('Failed to set tag:', error);
      throw error;
    }
  }

  async deleteTag(runId: string, key: string): Promise<any> {
    try {
      const response = await this.api.delete(`/api/runs/${runId}/tags/${key}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  }

  // Artifact methods
  async listArtifacts(runId: string, path?: string, pageToken?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (path) params.append('path', path);
      if (pageToken) params.append('pageToken', pageToken);
      
      const queryString = params.toString();
      const url = `/api/runs/${runId}/artifacts${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.api.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to list artifacts:', error);
      throw error;
    }
  }

  async downloadArtifact(runId: string, path: string): Promise<Blob> {
    try {
      const response = await this.api.get(`/api/runs/${runId}/artifacts/download?path=${encodeURIComponent(path)}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download artifact:', error);
      throw error;
    }
  }

  // Helper method to load directory contents
  async loadDirectoryContents(runId: string, dirPath: string): Promise<any[]> {
    try {
      const response = await this.listArtifacts(runId, dirPath);
      return this.buildFileTreeFromFiles(response.files || [], dirPath);
    } catch (error) {
      console.error('Failed to load directory contents:', error);
      throw error;
    }
  }

  // Helper method to convert MLflow run data to frontend Run format
  convertMLflowToRun(mlflowRun: any): any {
    console.log('Raw MLflow run data:', mlflowRun); // Debug log
    
    // Handle different possible response structures
    let runInfo = mlflowRun.info || mlflowRun.run || mlflowRun;
    let runData = mlflowRun.data || mlflowRun;
    let runInputs = mlflowRun.inputs || {};
    
    // If the response is wrapped in a 'run' object, unwrap it
    if (mlflowRun.run) {
      runInfo = mlflowRun.run.info || mlflowRun.run;
      runData = mlflowRun.run.data || mlflowRun.run;
      runInputs = mlflowRun.run.inputs || {};
    }
    
    console.log('Processed run info:', runInfo); // Debug log
    console.log('Processed run data:', runData); // Debug log
    
    // Extract metrics and convert to object format
    const metrics: any = {};
    if (runData?.metrics) {
      runData.metrics.forEach((metric: any) => {
        metrics[metric.key] = metric.value;
      });
    }

    // Extract parameters and convert to object format
    const parameters: any = {};
    if (runData?.params) {
      runData.params.forEach((param: any) => {
        parameters[param.key] = param.value;
      });
    }

    // Extract tags and convert to array format
    const tags: string[] = [];
    if (runData?.tags) {
      runData.tags.forEach((tag: any) => {
        // Skip MLflow internal tags, only show user-defined tags
        if (!tag.key.startsWith('mlflow.')) {
          tags.push(`${tag.key}: ${tag.value}`);
        }
      });
    }

    // Extract dataset information
    let dataset = 'N/A';
    let datasetDigest = '';
    let datasetSize = 'N/A';
    
    if (runInputs?.dataset_inputs && runInputs.dataset_inputs.length > 0) {
      const datasetInput = runInputs.dataset_inputs[0];
      if (datasetInput.dataset) {
        dataset = datasetInput.dataset.name || 'Unknown Dataset';
        datasetDigest = datasetInput.dataset.digest || '';
        
        // Extract dataset size from profile if available
        if (datasetInput.dataset.profile) {
          try {
            const profile = JSON.parse(datasetInput.dataset.profile);
            if (profile.features_size && profile.targets_size) {
              const totalSize = profile.features_size + profile.targets_size;
              datasetSize = `${totalSize} samples`;
            }
          } catch (e) {
            // If parsing fails, try to extract from schema
            if (datasetInput.dataset.schema) {
              try {
                const schema = JSON.parse(datasetInput.dataset.schema);
                if (schema.mlflow_tensorspec?.features) {
                  datasetSize = 'Available';
                }
              } catch (e2) {
                // Keep default N/A
              }
            }
          }
        }
      }
    }

    return {
      id: runInfo.run_id || runInfo.run_uuid || runInfo.id || 'unknown',
      name: runInfo.run_name || `Run ${(runInfo.run_id || runInfo.run_uuid || runInfo.id || 'unknown').substring(0, 8)}`,
      status: (runInfo.status || 'unknown').toLowerCase(), // Convert FINISHED -> finished, FAILED -> failed
      experimentId: runInfo.experiment_id || runInfo.experimentId || 'unknown',
      startedAt: this.safeTimestampToISO(runInfo.start_time),
      endedAt: runInfo.end_time ? this.safeTimestampToISO(runInfo.end_time) : undefined,
      duration: runInfo.end_time ? 
        Math.floor((new Date(this.safeTimestampToISO(runInfo.end_time)).getTime() - new Date(this.safeTimestampToISO(runInfo.start_time)).getTime()) / 1000) : 
        Math.floor((Date.now() - new Date(this.safeTimestampToISO(runInfo.start_time)).getTime()) / 1000),
      parameters: parameters,
      metrics: metrics,
      artifacts: [], // Would need separate API call to get artifacts
      logs: [], // Would need separate API call to get logs
      tags: tags,
      dataset: dataset,
      datasetDigest: datasetDigest,
      datasetSize: datasetSize,
    };
  }

  // Helper method to convert MLflow artifacts data to frontend file tree format
  convertMLflowArtifactsToFileTree(artifactsResponse: any): any {
    console.log('Raw MLflow artifacts response:', artifactsResponse);
    
    const files = artifactsResponse.files || [];
    const rootUri = artifactsResponse.root_uri || '';
    
    console.log('Files to process:', files);
    
    // Build file tree structure - return files directly without root "artifacts" node
    const fileTree = {
      name: 'root',
      type: 'folder',
      children: this.buildFileTreeFromFiles(files, '')
    };
    
    console.log('Built file tree:', fileTree);
    
    return fileTree;
  }

  // Helper method to build file tree from MLflow files array
  private buildFileTreeFromFiles(files: any[], basePath: string): any[] {
    const tree: any[] = [];
    const pathMap = new Map<string, any>();
    
    console.log('Building file tree from files:', files, 'basePath:', basePath);
    
    files.forEach(file => {
      const fullPath = file.path || '';
      const isDir = file.is_dir || false;
      const fileSize = file.file_size || 0;
      
      console.log('Processing file:', { fullPath, isDir, fileSize, file });
      
      // If we have a basePath, remove it from the fullPath to get relative path
      let relativePath = fullPath;
      if (basePath && fullPath.startsWith(basePath + '/')) {
        relativePath = fullPath.substring(basePath.length + 1);
      } else if (basePath && fullPath === basePath) {
        relativePath = '';
      }
      
      console.log('Relative path after removing basePath:', relativePath);
      
      // If relativePath is empty, skip (this shouldn't happen)
      if (!relativePath) {
        return;
      }
      
      // Split relative path into parts
      const pathParts = relativePath.split('/').filter((part: string) => part.length > 0);
      
      let currentPath = '';
      let parentNode = null;
      
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        // Build the full path for this node (including basePath)
        const fullNodePath = basePath ? `${basePath}/${currentPath}` : currentPath;
        
        if (!pathMap.has(currentPath)) {
          const isLastPart = i === pathParts.length - 1;
          const node = {
            name: part,
            type: isLastPart ? (isDir ? 'folder' : this.getFileType(part)) : 'folder',
            path: `/${fullNodePath}`,
            size: isLastPart ? fileSize : 0,
            isBinary: isLastPart && !isDir ? this.isBinaryFile(part) : false,
            isDir: isLastPart ? isDir : true,
            children: (isLastPart && isDir) || !isLastPart ? [] : undefined,
            loaded: false
          };
          
          console.log('Created node:', node);
          pathMap.set(currentPath, node);
          
          if (parentNode) {
            parentNode.children.push(node);
          } else {
            tree.push(node);
          }
        }
        
        parentNode = pathMap.get(currentPath);
      }
    });
    
    console.log('Final tree:', tree);
    return tree;
  }

  // Helper method to determine file type based on extension
  private getFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || '';
    
    if (['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx'].includes(ext)) {
      return 'model';
    } else if (['log', 'txt'].includes(ext)) {
      return 'log';
    } else if (['json', 'yaml', 'yml'].includes(ext)) {
      return 'config';
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
      return 'image';
    } else {
      return 'other';
    }
  }

  // Helper method to determine if file is binary
  private isBinaryFile(filename: string): boolean {
    const ext = filename.toLowerCase().split('.').pop() || '';
    const binaryExtensions = ['pkl', 'pickle', 'joblib', 'h5', 'hdf5', 'pb', 'onnx', 'bin', 'dat'];
    return binaryExtensions.includes(ext);
  }

  // Helper method to safely convert timestamp to ISO string
  private safeTimestampToISO(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    
    // Handle different timestamp formats
    let date: Date;
    if (typeof timestamp === 'number') {
      // MLflow timestamps are in milliseconds
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    
    return date.toISOString();
  }

  // Helper method to convert MLflow experiment data to frontend Experiment format
  convertMLflowToExperiment(mlflowResponse: any): Experiment {
    // Handle case where experiment data might be wrapped in an 'experiment' object
    const mlflowExperiment = mlflowResponse.experiment || mlflowResponse;
    
    return {
      id: mlflowExperiment.experiment_id,
      name: mlflowExperiment.name,
      description: mlflowExperiment.description || '',
      status: mlflowExperiment.lifecycle_stage === 'active' ? 'active' : 'completed',
      owner: {
        id: 'unknown',
        username: 'unknown',
        email: '',
        role: 'user',
        createdAt: new Date().toISOString(),
      },
      createdAt: this.safeTimestampToISO(mlflowExperiment.creation_time),
      updatedAt: this.safeTimestampToISO(mlflowExperiment.last_update_time),
      tags: mlflowExperiment.tags?.map((tag: any) => tag.value) || [],
      runs: [],
      metadata: {
        artifact_location: mlflowExperiment.artifact_location,
        lifecycle_stage: mlflowExperiment.lifecycle_stage,
      },
    };
  }

  // Inference Service methods
  async getInferenceServices(): Promise<InferenceService[]> {
    const response = await this.api.get<InferenceService[]>('/api/inference-services');
    return response.data;
  }

  async getInferenceServiceById(id: number): Promise<InferenceService> {
    const response = await this.api.get<InferenceService>(`/api/inference-services/${id}`);
    return response.data;
  }

  async getInferenceServiceByName(name: string): Promise<InferenceService> {
    const response = await this.api.get<InferenceService>(`/api/inference-services/name/${name}`);
    return response.data;
  }

  async getInferenceServicesByStatus(status: string): Promise<InferenceService[]> {
    const response = await this.api.get<InferenceService[]>(`/api/inference-services/status/${status}`);
    return response.data;
  }

  async getInferenceServicesByNamespace(namespace: string): Promise<InferenceService[]> {
    const response = await this.api.get<InferenceService[]>(`/api/inference-services/namespace/${namespace}`);
    return response.data;
  }

  async searchInferenceServices(query: string): Promise<InferenceService[]> {
    const response = await this.api.get<InferenceService[]>(`/api/inference-services/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  async createInferenceService(service: Partial<InferenceService>): Promise<InferenceService> {
    const response = await this.api.post<InferenceService>('/api/inference-services', service);
    return response.data;
  }

  async updateInferenceService(id: number, service: Partial<InferenceService>): Promise<InferenceService> {
    const response = await this.api.put<InferenceService>(`/api/inference-services/${id}`, service);
    return response.data;
  }

  async deleteInferenceService(id: number): Promise<void> {
    await this.api.delete(`/api/inference-services/${id}`);
  }

  async updateInferenceServiceStatus(id: number, status: string): Promise<InferenceService> {
    const response = await this.api.patch<InferenceService>(`/api/inference-services/${id}/status`, { status });
    return response.data;
  }

  // Get loaded models from an inference service via backend API
  async getInferenceServiceLoadedModels(serviceId: number): Promise<any[]> {
    try {
      const response = await this.api.get(`/api/inference-services/${serviceId}/models`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to fetch loaded models:', error);
      return [];
    }
  }

  // Entrypoint methods
  async getEntrypoints(): Promise<any[]> {
    const response = await this.api.get<any[]>('/api/entrypoints');
    return response.data;
  }

  async getEntrypointById(id: number): Promise<any> {
    const response = await this.api.get<any>(`/api/entrypoints/${id}`);
    return response.data;
  }

  async getEntrypointByName(name: string): Promise<any> {
    const response = await this.api.get<any>(`/api/entrypoints/name/${encodeURIComponent(name)}`);
    return response.data;
  }

  async getEntrypointsByStatus(status: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/api/entrypoints/status/${status}`);
    return response.data;
  }

  async getEntrypointsByType(type: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/api/entrypoints/type/${type}`);
    return response.data;
  }

  async searchEntrypoints(query: string): Promise<any[]> {
    const response = await this.api.get<any[]>(`/api/entrypoints/search?query=${encodeURIComponent(query)}`);
    return response.data;
  }

  async createEntrypoint(entrypoint: any): Promise<any> {
    const response = await this.api.post<any>('/api/entrypoints', entrypoint);
    return response.data;
  }

  async updateEntrypoint(id: number, entrypoint: any): Promise<any> {
    const response = await this.api.put<any>(`/api/entrypoints/${id}`, entrypoint);
    return response.data;
  }

  async deleteEntrypoint(id: number): Promise<void> {
    await this.api.delete(`/api/entrypoints/${id}`);
  }

  async updateEntrypointStatus(id: number, status: string): Promise<any> {
    const response = await this.api.patch<any>(`/api/entrypoints/${id}/status`, { status });
    return response.data;
  }

  // Call entrypoint (gateway feature)
  async callEntrypoint(id: number, requestData: any): Promise<any> {
    const response = await this.api.post<any>(`/api/entrypoints/${id}/infer`, requestData);
    return response.data;
  }

  async getEntrypointHistory(id: number): Promise<any[]> {
    const response = await this.api.get<any[]>(`/api/entrypoints/${id}/history`);
    return response.data;
  }

  async getEntrypointMetrics(id: number, hours: number = 24): Promise<any> {
    const response = await this.api.get<any>(`/api/entrypoints/${id}/metrics`, {
      params: { hours }
    });
    return response.data;
  }

  async getEntrypointDailyMetrics(id: number, days: number = 30): Promise<any> {
    const response = await this.api.get<any>(`/api/entrypoints/${id}/metrics/daily`, {
      params: { days }
    });
    return response.data;
  }
}

export const apiService = new ApiService();
