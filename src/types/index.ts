// Core types for the MLOps Hub platform

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
  lastLogin?: string;
}

export interface Dataset {
  id: number;
  datasetUuid: string;
  name: string;
  description?: string;
  fileFormat?: string;
  totalSize?: number;
  createdAt: string;
  updatedAt: string;
  versions?: DatasetVersion[];
}

export interface DatasetVersion {
  id: number;
  versionId: string;
  datasetId: number;
  versionNumber: number;
  description?: string;
  status: 'DRAFT' | 'COMMITTED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  committedAt?: string;
  files?: DatasetFile[];
}

export interface DatasetFile {
  id: number;
  fileId: string;
  versionId: number;
  fileName: string;
  filePath: string;
  fileSize?: number;
  fileFormat?: string;
  digest: string;
  createdAt: string;
  updatedAt: string;
}

// MLflow-specific types
export interface MLflowRegisteredModel {
  name: string;
  creation_timestamp: number;
  last_updated_timestamp: number;
  description?: string;
  latest_versions?: MLflowModelVersion[];
  tags?: MLflowTag[];
  user_id?: string;
  aliases?: MLflowAlias[];
}

export interface MLflowModelVersion {
  name: string;
  version: string;
  creation_timestamp: number;
  last_updated_timestamp: number;
  user_id?: string;
  current_stage: string;
  description?: string;
  source: string;
  run_id: string;
  status: string;
  status_message?: string;
  tags?: MLflowTag[];
  run_link?: string;
}

export interface MLflowTag {
  key: string;
  value: string;
}

export interface MLflowAlias {
  alias: string;
  version: string;
}

export interface MLflowModelVersionsResponse {
  model_versions: MLflowModelVersion[];
}

export interface MLflowRegisteredModelsResponse {
  registered_models: MLflowRegisteredModel[];
}

// Enhanced Model interface that combines MLflow data with frontend-specific fields
export interface Model {
  id: string;
  name: string;
  description: string;
  version: string;
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'onnx' | 'other';
  tags: string[];
  visibility: 'public' | 'private' | 'organization';
  owner: User;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  files: ModelFile[];
  metadata: Record<string, any>;
  performance: ModelPerformance;
  solutionId?: string;
  solutionName?: string;
  // MLflow-specific fields
  mlflowName?: string;
  mlflowVersion?: string;
  currentStage?: string;
  source?: string;
  runId?: string;
  status?: string;
  statusMessage?: string;
  runLink?: string;
  creationTimestamp?: number;
  lastUpdatedTimestamp?: number;
}

export interface ModelFile {
  id: string;
  name: string;
  path: string;
  size: number;
  checksum: string;
  uploadedAt: string;
  type: 'model' | 'config' | 'weights' | 'tokenizer' | 'other';
}

export interface ModelPerformance {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  auc?: number;
  loss?: number;
  metrics: Record<string, number>;
}

export interface InferenceService {
  id: number;
  name: string;
  description: string;
  status: 'running' | 'stopped' | 'error' | 'pending' | 'no_response';
  namespace: string;
  replicas: number;
  cpu: string;
  memory: string;
  image: string;
  port: number;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
  tags: string; // JSON string from backend
  // Optional fields for UI compatibility
  metrics?: {
    requestsPerSecond: number;
    averageLatency: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage?: number;
    totalCpuMemory?: number;
    allocatedCpuMemory?: number;
    totalGpuMemory?: number;
    allocatedGpuMemory?: number;
    modelCpuMemory?: Array<{ modelName: string; cpuMemory: number }>;
    modelGpuMemory?: Array<{ modelName: string; gpuMemory: number }>;
  };
  entrypoints?: Entrypoint[];
  owner?: User;
  visibility: 'public' | 'private' | 'organization';
}

export interface Entrypoint {
  id: string;
  name: string;
  description: string;
  version: string;
  type: 'api' | 'batch' | 'streaming' | 'scheduled' | 'webhook';
  status: 'active' | 'inactive' | 'deployed' | 'failed';
  _links?: {
    self: string;
    infer?: string;
    update?: string;
    delete?: string;
    status?: string;
  };
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  modelId: string;
  modelName: string;
  modelType?: string;
  inferenceServiceId: string;
  inferenceServiceName: string;
  path?: string;
  fullInferencePath?: string;
  tags: string[];
  visibility: 'public' | 'private' | 'organization';
  owner: User;
  createdAt: string;
  updatedAt: string;
  lastDeployed?: string;
  deploymentConfig: DeploymentConfig;
  metrics: EntrypointMetrics;
  metadata: Record<string, any>;
  solutionId?: string;
  solutionName?: string;
}

export interface DeploymentConfig {
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
  environment: Record<string, string>;
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
  };
  scaling: {
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
  };
}

export interface EntrypointMetrics {
  requests: number;
  latency: number;
  errorRate: number;
  throughput: number;
  uptime: number;
  lastRequest?: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  category:
    | 'nlp'
    | 'computer_vision'
    | 'time_series'
    | 'recommendation'
    | 'anomaly_detection'
    | 'other';
  type:
    | 'knowledge_extraction'
    | 'sales_prediction'
    | 'text_classification'
    | 'image_recognition'
    | 'forecasting'
    | 'fraud_detection'
    | 'sentiment_analysis'
    | 'object_detection'
    | 'recommendation_engine'
    | 'custom';
  status: 'available' | 'in_development' | 'deprecated';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  visibility: 'public' | 'private' | 'organization';
  owner: User;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  rating: number;
  useCases: string[];
  requirements: {
    frameworks: string[];
    datasets: string[];
    compute: string;
    memory: string;
  };
  templates: SolutionTemplate[];
  metadata: Record<string, any>;
}

export interface SolutionTemplate {
  id: string;
  name: string;
  description: string;
  framework: 'tensorflow' | 'pytorch' | 'sklearn' | 'huggingface' | 'other';
  language: 'python' | 'r' | 'julia' | 'other';
  files: TemplateFile[];
  instructions: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface TemplateFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'code' | 'config' | 'readme' | 'data' | 'other';
  size: number;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  owner: User;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  runs: Run[];
  metadata: Record<string, any>;
}

export interface Run {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'finished' | 'failed' | 'cancelled';
  experimentId: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  parameters: Record<string, any>;
  metrics: Record<string, number>;
  artifacts: Artifact[];
  logs: LogEntry[];
  tags: string[];
  dataset?: string;
  datasetDigest?: string;
  datasetSize?: number;
  artifactUri?: string;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'model' | 'dataset' | 'image' | 'text' | 'json' | 'other';
  path: string;
  size: number;
  createdAt: string;
  metadata: Record<string, any>;
  isBinary?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export interface ModelMonitoring {
  id: string;
  modelId: string;
  name: string;
  type: 'api' | 'batch' | 'streaming' | 'scheduled' | 'webhook';
  status: 'active' | 'paused' | 'failed';
  metrics: MonitoringMetric[];
  alerts: Alert[];
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringMetric {
  name: string;
  value: number;
  timestamp: string;
  threshold?: {
    min?: number;
    max?: number;
  };
  status: 'normal' | 'warning' | 'critical';
}

export interface Alert {
  id: string;
  type: 'drift' | 'performance' | 'data_quality' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'organization';
  owner?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardStats {
  totalDatasets: number;
  totalModels: number;
  totalEntrypoints: number;
  totalInferenceServices: number;
  totalExperiments: number;
  totalSolutions: number;
  activeMonitoring: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type:
    | 'dataset_upload'
    | 'model_upload'
    | 'entrypoint_deploy'
    | 'entrypoint_update'
    | 'inference_service_deploy'
    | 'inference_service_update'
    | 'experiment_create'
    | 'run_complete'
    | 'solution_create'
    | 'solution_download'
    | 'alert_triggered';
  user: User;
  resource: {
    type:
      | 'dataset'
      | 'model'
      | 'entrypoint'
      | 'inference_service'
      | 'experiment'
      | 'run'
      | 'solution'
      | 'monitoring';
    id: string;
    name: string;
  };
  timestamp: string;
  description: string;
}
