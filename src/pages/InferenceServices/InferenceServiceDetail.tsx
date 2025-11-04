import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Avatar,
  Button,
  TextField,
  Alert,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Cloud as CloudIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as ModelIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { InferenceService } from '../../types';
import { apiService } from '../../services/api';

const InferenceServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [k8sSettingsExpanded, setK8sSettingsExpanded] = useState(false);
  const [service, setService] = useState<InferenceService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedModels, setLoadedModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Prevent duplicate API calls
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (id && !hasLoaded.current) {
      loadService();
    }
  }, [id]);

  const loadService = async () => {
    if (!id || hasLoaded.current) return;
    
    try {
      hasLoaded.current = true;
      console.log('Loading inference service:', id);
      const serviceData = await apiService.getInferenceServiceById(Number(id));
      console.log('Service data:', serviceData);
      setService(serviceData);
      
      // Load models after service is loaded
      if (serviceData?.id) {
        loadModels(serviceData.id);
      }
    } catch (error) {
      console.error('Failed to load inference service:', error);
      setError('Failed to load inference service');
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async (serviceId: number) => {
    try {
      setModelsLoading(true);
      console.log('Loading models from inference service ID:', serviceId);
      const models = await apiService.getInferenceServiceLoadedModels(serviceId);
      console.log('Loaded models:', models);
      setLoadedModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
      setLoadedModels([]);
    } finally {
      setModelsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error || !service) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || 'Service not found'}
        </Alert>
        <Button onClick={() => navigate('/inference-services')} sx={{ mt: 2 }}>
          Back to Services
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'success';
      case 'stopped':
        return 'default';
      case 'error':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon />;
      case 'stopped':
        return <StopIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'pending':
        return <RefreshIcon />;
      case 'no_response':
        return <ErrorIcon />;
      default:
        return <StopIcon />;
    }
  };

  // Mock performance data
  const performanceData = [
    { time: '00:00', requests: 120, latency: 42, errors: 2 },
    { time: '04:00', requests: 95, latency: 38, errors: 1 },
    { time: '08:00', requests: 180, latency: 48, errors: 3 },
    { time: '12:00', requests: 220, latency: 52, errors: 4 },
    { time: '16:00', requests: 190, latency: 45, errors: 2 },
    { time: '20:00', requests: 150, latency: 43, errors: 2 },
  ];

  const renderOverview = () => (
    <Grid container spacing={3}>
      {/* Model Memory Allocation Charts */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              CPU Memory Usage
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      ...(service.metrics?.modelCpuMemory || []),
                      {
                        modelName: 'Remaining',
                        cpuMemory:
                          (service.metrics?.totalCpuMemory || 0) -
                          (service.metrics?.allocatedCpuMemory || 0),
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="cpuMemory"
                  >
                    {[
                      ...(service.metrics?.modelCpuMemory || []),
                      {
                        modelName: 'Remaining',
                        cpuMemory:
                          (service.metrics?.totalCpuMemory || 0) -
                          (service.metrics?.allocatedCpuMemory || 0),
                      },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.modelName === 'Remaining'
                            ? '#e0e0e0'
                            : ['#1976d2', '#42a5f5', '#90caf9'][index % 3]
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number, name: string, props: any) => [
                      `${value}Mi`,
                      props.payload.modelName,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h4" color="primary">
                  {Math.round(
                    ((service.metrics?.allocatedCpuMemory || 0) /
                      (service.metrics?.totalCpuMemory || 1)) *
                      100
                  )}
                  %
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Used
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              {[
                ...(service.metrics?.modelCpuMemory || []),
                {
                  modelName: 'Remaining',
                  cpuMemory:
                    (service.metrics?.totalCpuMemory || 0) -
                    (service.metrics?.allocatedCpuMemory || 0),
                },
              ].map((model, index) => (
                <Box
                  key={model.modelName}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor:
                        model.modelName === 'Remaining'
                          ? '#e0e0e0'
                          : ['#1976d2', '#42a5f5', '#90caf9'][index % 3],
                      borderRadius: '50%',
                      mr: 1,
                    }}
                  />
                  <Typography variant="body2">
                    {model.modelName}: {model.cpuMemory}Mi
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Usage Summary and Performance Metrics */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Usage Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Total PODs
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {service.replicas}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Running instances
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Total CPU Memory
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {service.metrics?.totalCpuMemory || 0}Mi
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Allocated: {service.metrics?.allocatedCpuMemory || 0}Mi
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Requests Per Second
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {service.metrics?.requestsPerSecond}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    requests/sec
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Latency
                  </Typography>
                  <Typography variant="h4" color="secondary">
                    {service.metrics?.averageLatency}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    milliseconds
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Error Rate
                  </Typography>
                  <Typography variant="h4" color="error">
                    {((service.metrics?.errorRate || 0) * 100).toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    percentage
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Endpoints
                  </Typography>
                  <Typography variant="h4" color="success">
                    {service.entrypoints?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    deployed endpoints
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Chart */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="requests"
                  stroke="#1976d2"
                  strokeWidth={2}
                  name="Requests/sec"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="latency"
                  stroke="#2e7d32"
                  strokeWidth={2}
                  name="Latency (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Error Rate Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Error Rate
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="errors" fill="#d32f2f" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Resource Usage Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resource Usage
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { name: 'CPU', usage: service.metrics?.cpuUsage },
                  { name: 'Memory', usage: service.metrics?.memoryUsage },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip
                  formatter={(value: number) => [`${value}%`, 'Usage']}
                />
                <Bar dataKey="usage" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderModels = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Loaded Models</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => service?.id && loadModels(service.id)}
          disabled={modelsLoading}
        >
          Refresh
        </Button>
      </Box>

      {modelsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading models...</Typography>
        </Box>
      ) : loadedModels.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ModelIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Models Loaded
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This inference service doesn't have any models loaded yet.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Model Name</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Origin</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Loaded At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loadedModels.map((model, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ModelIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight="medium">
                        {model.name || 'Unknown Model'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.version || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.type || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={model.source_type || 'Unknown'}
                      color={model.source_type === 'MLflow' ? 'primary' : model.source_type === 'Hugging Face' ? 'secondary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', maxWidth: 200 }}>
                      {model.source || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={model.status || 'loaded'}
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {model.loaded_at ? new Date(model.loaded_at).toLocaleString() : 'Unknown'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderSettings = () => {
    // Mock Kubernetes service YAML
    const serviceYaml = `apiVersion: v1
kind: Service
metadata:
  name: ${service.name.toLowerCase().replace(/\s+/g, '-')}
  namespace: ${service.namespace}
  labels:
    app: ${service.name.toLowerCase().replace(/\s+/g, '-')}
    component: inference-service
spec:
  type: ClusterIP
  ports:
  - port: ${service.port}
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: ${service.name.toLowerCase().replace(/\s+/g, '-')}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service.name.toLowerCase().replace(/\s+/g, '-')}-deployment
  namespace: ${service.namespace}
  labels:
    app: ${service.name.toLowerCase().replace(/\s+/g, '-')}
    component: inference-service
spec:
  replicas: ${service.replicas}
  selector:
    matchLabels:
      app: ${service.name.toLowerCase().replace(/\s+/g, '-')}
  template:
    metadata:
      labels:
        app: ${service.name.toLowerCase().replace(/\s+/g, '-')}
        component: inference-service
    spec:
      containers:
      - name: inference-service
        image: ${service.image}
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "${service.cpu}"
            memory: "${service.memory}"
          limits:
            cpu: "${service.cpu}"
            memory: "${service.memory}"
        env:
        - name: PORT
          value: "8080"
        - name: NAMESPACE
          value: "${service.namespace}"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5`;

    const handleCopyYaml = () => {
      navigator.clipboard.writeText(serviceYaml);
    };

    const handleEditToggle = () => {
      setIsEditing(!isEditing);
    };

    const handleSave = () => {
      // TODO: Implement save functionality
      setIsEditing(false);
    };

    const handleCancel = () => {
      setIsEditing(false);
    };

    return (
      <Grid container spacing={3}>
        {/* Basic Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Basic Settings</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleSave}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={handleEditToggle}
                    >
                      Edit
                    </Button>
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Configure basic service settings and preferences.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Service Name"
                    value={service.name}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: !isEditing }}
                    helperText="Service name cannot be changed after creation"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Description"
                    value={service.description}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    InputProps={{ readOnly: !isEditing }}
                    helperText="Service description"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Base URL"
                    value={service.baseUrl}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: !isEditing }}
                    helperText="Service endpoint URL for API calls"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Owner"
                    value={service.owner?.username || ''}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="Service owner"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tags"
                    value={(() => {
                      try {
                        if (service.tags) {
                          if (typeof service.tags === 'string') {
                            const parsedTags = JSON.parse(service.tags);
                            return Array.isArray(parsedTags) ? parsedTags.join(', ') : '';
                          }
                        }
                        return '';
                      } catch (error) {
                        console.error('Error parsing tags:', service.tags, error);
                        return '';
                      }
                    })()}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: !isEditing }}
                    helperText="Service tags for categorization"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Kubernetes Service Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Kubernetes Service Settings
                </Typography>
                {!service.name && (
                  <IconButton
                    onClick={() => setK8sSettingsExpanded(!k8sSettingsExpanded)}
                    size="small"
                  >
                    {k8sSettingsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}
              </Box>
              
              {service.name ? (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    This inference service is deployed as a Kubernetes service.
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Service Name"
                        value={service.name.toLowerCase().replace(/\s+/g, '-')}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Namespace"
                        value={service.namespace}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Image"
                        value={service.image}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Port"
                        value={service.port}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Replicas"
                        value={service.replicas}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="CPU/Memory"
                        value={`${service.cpu} CPU, ${service.memory} Memory`}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <Collapse in={k8sSettingsExpanded}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Service name is required to configure Kubernetes settings.
                  </Alert>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Service Name"
                        value=""
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                        placeholder="Enter service name first"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Namespace"
                        value={service.namespace}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Image"
                        value={service.image}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Port"
                        value={service.port}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Replicas"
                        value={service.replicas}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="CPU/Memory"
                        value={`${service.cpu} CPU, ${service.memory} Memory`}
                        fullWidth
                        size="small"
                        InputProps={{ readOnly: !isEditing }}
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* YAML Configuration */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">YAML Configuration</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={handleCopyYaml}
                >
                  Copy
                </Button>
              </Box>

              <TextField
                multiline
                rows={25}
                value={serviceYaml}
                fullWidth
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    '& textarea': {
                      resize: 'vertical',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/inference-services')}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <CloudIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {service.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {service.namespace} • {service.replicas} replicas
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label={service.status}
            color={service.status === 'running' ? 'success' : 'default'}
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab icon={<ModelIcon />} label="Models" />
            <Tab icon={<TimelineIcon />} label="Metrics" />
            <Tab icon={<SettingsIcon />} label="Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && renderModels()}
          {activeTab === 1 && renderOverview()}
          {activeTab === 2 && renderSettings()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InferenceServiceDetail;
