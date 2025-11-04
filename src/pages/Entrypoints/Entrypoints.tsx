import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GridRowId } from '@mui/x-data-grid';

import DataTable from '../../components/UI/DataTable/DataTable';
import SearchBar from '../../components/UI/SearchBar/SearchBar';
import AddEntrypointDialog from '../../components/UI/AddEntrypointDialog/AddEntrypointDialog';
import { apiService } from '../../services/api';
import { Entrypoint } from '../../types';

// Mock data for entrypoints
const mockEntrypoints: Entrypoint[] = [
  {
    id: '1',
    name: 'Sentiment Analysis API',
    description: 'Real-time sentiment analysis for customer reviews',
    version: '1.2.0',
    type: 'api',
    status: 'active',
    _links: { self: '/api/entrypoints/1' },
    method: 'POST',
    modelId: 'model-1',
    modelName: 'PaddleNLP Text Classifier',
    inferenceServiceId: 'inf-1',
    inferenceServiceName: 'NLP Inference Service #1',
    tags: ['nlp', 'sentiment', 'production'],
    visibility: 'public',
    owner: {
      id: 'user-1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    lastDeployed: '2024-01-20T14:22:00Z',
    solutionId: 'sol-3',
    solutionName: 'Text Classification Pipeline',
    deploymentConfig: {
      replicas: 3,
      resources: {
        cpu: '1000m',
        memory: '2Gi',
      },
      environment: {
        MODEL_PATH: '/models/sentiment-v1',
        BATCH_SIZE: '32',
      },
      healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
      },
      scaling: {
        minReplicas: 1,
        maxReplicas: 10,
        targetCPU: 70,
      },
    },
    metrics: {
      requests: 15420,
      latency: 45,
      errorRate: 0.02,
      throughput: 120,
      uptime: 99.8,
      lastRequest: '2024-01-20T15:30:00Z',
    },
    metadata: {
      framework: 'tensorflow',
      modelSize: '150MB',
      inputFormat: 'json',
      outputFormat: 'json',
    },
  },
  {
    id: '2',
    name: 'Token Classification Batch',
    description:
      'Batch processing for token classification tasks using transformers',
    version: '2.1.0',
    type: 'batch',
    status: 'deployed',
    modelId: 'model-2',
    modelName: 'Transformer Text Classifier',
    inferenceServiceId: 'inf-2',
    inferenceServiceName: 'NLP Inference Service #2',
    tags: ['nlp', 'batch', 'token-classification', 'transformers'],
    visibility: 'private',
    owner: {
      id: 'user-2',
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'user',
      createdAt: '2024-01-02T00:00:00Z',
    },
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    lastDeployed: '2024-01-18T16:45:00Z',
    solutionId: 'sol-4',
    solutionName: 'Image Recognition System',
    deploymentConfig: {
      replicas: 1,
      resources: {
        cpu: '2000m',
        memory: '4Gi',
        gpu: '1',
      },
      environment: {
        MODEL_PATH: '/models/image-classifier-v2',
        BATCH_SIZE: '16',
        GPU_MEMORY: '8GB',
      },
      healthCheck: {
        path: '/health',
        interval: 60,
        timeout: 10,
      },
      scaling: {
        minReplicas: 1,
        maxReplicas: 5,
        targetCPU: 80,
      },
    },
    metrics: {
      requests: 8500,
      latency: 1200,
      errorRate: 0.01,
      throughput: 45,
      uptime: 99.5,
      lastRequest: '2024-01-20T12:15:00Z',
    },
    metadata: {
      framework: 'pytorch',
      modelSize: '500MB',
      inputFormat: 'image',
      outputFormat: 'json',
      schedule: '0 2 * * *', // Daily at 2 AM
    },
  },
  {
    id: '3',
    name: 'Text Embedding API',
    description: 'Real-time text embedding service for semantic search',
    version: '1.0.0',
    type: 'api',
    status: 'active',
    _links: { self: '/api/entrypoints/3' },
    method: 'POST',
    modelId: 'model-3',
    modelName: 'Text Embedding Model',
    inferenceServiceId: 'inf-3',
    inferenceServiceName: 'Embedding Inference Service',
    tags: ['embeddings', 'semantic-search', 'nlp'],
    visibility: 'organization',
    owner: {
      id: 'user-1',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-12T13:30:00Z',
    deploymentConfig: {
      replicas: 2,
      resources: {
        cpu: '500m',
        memory: '1Gi',
      },
      environment: {
        MODEL_PATH: '/models/recommendation-v1',
        CACHE_TTL: '3600',
      },
      healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
      },
      scaling: {
        minReplicas: 1,
        maxReplicas: 8,
        targetCPU: 60,
      },
    },
    metrics: {
      requests: 0,
      latency: 0,
      errorRate: 0,
      throughput: 0,
      uptime: 0,
    },
    metadata: {
      framework: 'sklearn',
      modelSize: '50MB',
      inputFormat: 'json',
      outputFormat: 'json',
    },
  },
];

const Entrypoints: React.FC = () => {
  const [entrypoints, setEntrypoints] = useState<Entrypoint[]>([]);
  const [filteredEntrypoints, setFilteredEntrypoints] = useState<Entrypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Prevent duplicate API calls
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadEntrypoints();
    }
  }, []);

  const loadEntrypoints = async () => {
    if (hasLoaded.current) return; // Prevent duplicate calls
    
    try {
      hasLoaded.current = true;
      setLoading(true);
      setError(null);
      const data = await apiService.getEntrypoints();
      // Transform backend data to match frontend Entrypoint interface
      const transformedData = data.map((ep: any) => {
        let tags: string[] = [];
        if (ep.tags) {
          try {
            tags = typeof ep.tags === 'string' ? JSON.parse(ep.tags) : ep.tags;
          } catch {
            tags = [];
          }
        }

        let deploymentConfig = {};
        if (ep.deploymentConfig) {
          try {
            deploymentConfig = typeof ep.deploymentConfig === 'string' 
              ? JSON.parse(ep.deploymentConfig) 
              : ep.deploymentConfig;
          } catch {
            deploymentConfig = {};
          }
        }

        let metrics = {};
        if (ep.metricsData) {
          try {
            metrics = typeof ep.metricsData === 'string' 
              ? JSON.parse(ep.metricsData) 
              : ep.metricsData;
          } catch {
            metrics = {};
          }
        }

        // Ensure metrics has default values to prevent undefined errors
        const safeMetrics = {
          requests: 0,
          latency: 0,
          errorRate: 0,
          throughput: 0,
          uptime: 0,
          lastRequest: undefined,
          ...metrics,
        };

        // Ensure deploymentConfig has default values to prevent undefined errors
        const safeDeploymentConfig = {
          replicas: 1,
          resources: {
            cpu: '1000m',
            memory: '2Gi',
          },
          environment: {},
          healthCheck: {
            path: '/health',
            interval: 30,
            timeout: 5,
          },
          scaling: {
            minReplicas: 1,
            maxReplicas: 10,
            targetCPU: 70,
          },
          ...deploymentConfig,
        };

        return {
          id: ep.id.toString(),
          name: ep.name,
          description: ep.description || '',
          version: ep.version || '1.0.0',
          type: ep.type || 'api',
          status: ep.status || 'inactive',
          _links: ep._links,
          method: ep.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | undefined,
          modelId: ep.modelId?.toString() || '',
          modelName: ep.modelName || '',
          modelType: ep.modelType || undefined,
          inferenceServiceId: ep.inferenceServiceId?.toString() || '',
          inferenceServiceName: ep.inferenceServiceName || '',
          path: ep.path || undefined,
          fullInferencePath: ep.fullInferencePath || undefined,
          tags,
          visibility: ep.visibility || 'private' as 'public' | 'private' | 'organization',
          owner: {
            id: ep.ownerId?.toString() || '',
            username: ep.ownerUsername || 'unknown',
            email: '',
            role: 'user',
            createdAt: ep.createdAt || new Date().toISOString(),
          },
          createdAt: ep.createdAt || new Date().toISOString(),
          updatedAt: ep.updatedAt || new Date().toISOString(),
          lastDeployed: ep.lastDeployed,
          deploymentConfig: safeDeploymentConfig as any,
          metrics: safeMetrics as any,
          metadata: {},
        } as Entrypoint;
      });
      setEntrypoints(transformedData);
      setFilteredEntrypoints(transformedData);
    } catch (err) {
      console.error('Failed to load entrypoints:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entrypoints');
      // Fall back to empty array or mock data for testing
      setEntrypoints([]);
      setFilteredEntrypoints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredEntrypoints(entrypoints);
      return;
    }
    
    const filtered = entrypoints.filter(
      entrypoint =>
        entrypoint.name.toLowerCase().includes(query.toLowerCase()) ||
        entrypoint.description.toLowerCase().includes(query.toLowerCase()) ||
        entrypoint.tags.some(tag =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );
    setFilteredEntrypoints(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'deployed':
        return 'primary';
      case 'inactive':
        return 'default';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api':
        return '🌐';
      case 'batch':
        return '⚡';
      case 'streaming':
        return '📡';
      case 'scheduled':
        return '⏰';
      case 'webhook':
        return '🔗';
      default:
        return '📦';
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params: any) => (
        <Box>
          <Typography variant="subtitle2" fontWeight="bold">
            {getTypeIcon(params.row.type)} {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'inferenceServiceName',
      headerName: 'Inference Service',
      width: 180,
      renderCell: (params: any) => (
        <Box>
          {params.value ? (
            <Typography
              variant="body2"
              sx={{
                color: 'primary.main',
                cursor: 'pointer',
                textDecoration: 'underline',
                '&:hover': {
                  color: 'primary.dark',
                },
              }}
              onClick={e => {
                e.stopPropagation(); // Prevent row click from triggering
                navigate(
                  `/inference-services/${params.row.inferenceServiceId}`
                );
              }}
            >
              {params.value}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No Service
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value.toUpperCase()}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value) as any}
        />
      ),
    },
    {
      field: 'endpoint',
      headerName: 'Endpoint',
      width: 250,
      renderCell: (params: any) => (
        <Typography variant="body2" noWrap>
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.slice(0, 2).map((tag: string) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
          {params.value.length > 2 && (
            <Chip
              label={`+${params.value.length - 2}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      ),
    },
    {
      field: 'solutionName',
      headerName: 'Solution',
      width: 150,
      renderCell: (params: any) => (
        <Box>
          {params.value ? (
            <Chip
              label={
                params.value.length > 15
                  ? params.value.substring(0, 15) + '...'
                  : params.value
              }
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => navigate(`/solutions/${params.row.solutionId}`)}
              sx={{ cursor: 'pointer', maxWidth: '100%' }}
              title={params.value}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              Standalone
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'modelName',
      headerName: 'Model',
      width: 150,
      renderCell: (params: any) => (
        <Box>
          {params.value ? (
            <Chip
              label={
                params.value.length > 15
                  ? params.value.substring(0, 15) + '...'
                  : params.value
              }
              size="small"
              color="secondary"
              variant="outlined"
              onClick={() => navigate(`/models/${params.row.modelId}`)}
              sx={{ cursor: 'pointer', maxWidth: '100%' }}
              title={params.value}
            />
          ) : (
            <Typography variant="caption" color="text.secondary">
              No Model
            </Typography>
          )}
        </Box>
      ),
    },
  ];

  const handleEdit = (id: GridRowId) => {
    console.log('Edit entrypoint:', id);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (id: GridRowId) => {
    try {
      await apiService.deleteEntrypoint(Number(id));
      await loadEntrypoints();
    } catch (err) {
      console.error('Failed to delete entrypoint:', err);
    }
  };

  const handleDeploy = async (id: GridRowId) => {
    try {
      await apiService.updateEntrypointStatus(Number(id), 'active');
      await loadEntrypoints();
    } catch (err) {
      console.error('Failed to deploy entrypoint:', err);
    }
  };

  const handleView = (id: GridRowId) => {
    navigate(`/entrypoints/${id}`);
  };

  const handleCreateEntrypoint = async (entrypointData: any) => {
    try {
      await apiService.createEntrypoint(entrypointData);
      await loadEntrypoints();
    } catch (err) {
      console.error('Failed to create entrypoint:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Entrypoints
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Create Entrypoint
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AddEntrypointDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleCreateEntrypoint}
      />

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <SearchBar
              placeholder="Search entrypoints..."
              onSearch={handleSearch}
            />
          </Box>

          <DataTable
            rows={filteredEntrypoints}
            columns={columns}
            onRowClick={params => handleView(params.id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDeploy}
            getRowId={row => row.id}
            pageSize={10}
            pageSizeOptions={[5, 10, 25]}
            disableSelectionOnClick
            density="comfortable"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default Entrypoints;
